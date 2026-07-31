using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using FYURI.Server.Models;
using FYURI.Server.Data;

namespace FYURI.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BuilderController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<BuilderController> _logger;

    public BuilderController(AppDbContext context, ILogger<BuilderController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Creates a hidden custom-build product from a builder configuration so it can be added to the cart.
    /// All part identities, availability and prices are validated/computed server-side against
    /// <see cref="BuilderCatalog"/> — client-supplied names/prices are never trusted.
    /// </summary>
    [HttpPost("custom-build")]
    [EnableRateLimiting("builder")]
    public async Task<ActionResult<Product>> CreateCustomBuild([FromBody] CustomBuildRequest request)
    {
        try
        {
            if (request.Parts == null || request.Parts.Count == 0)
            {
                return BadRequest("A custom build must contain at least one part");
            }

            if (!BuilderCatalog.DeviceTypes.ContainsKey(request.DeviceType))
            {
                return BadRequest("Unknown device type");
            }

            // Validate every part against the server-side catalog and compute the price.
            var seenCategories = new HashSet<string>();
            decimal totalPrice = 0;
            var lines = new List<(BuilderCatalog.BuilderCategory Category, BuilderCatalog.BuilderOption Option, int Quantity)>();

            foreach (var part in request.Parts)
            {
                var category = BuilderCatalog.FindCategory(part.CategoryId);
                if (category == null)
                {
                    return BadRequest($"Unknown component category '{part.CategoryId}'");
                }

                if (!seenCategories.Add(category.Id))
                {
                    return BadRequest($"Duplicate component category '{category.Id}'");
                }

                var option = BuilderCatalog.FindOption(category, part.OptionId, request.DeviceType);
                if (option == null)
                {
                    return BadRequest($"Invalid option '{part.OptionId}' for category '{category.Id}' and device type '{request.DeviceType}'");
                }

                if (!option.Available)
                {
                    return BadRequest($"Option '{option.NameEn}' is currently unavailable");
                }

                var quantity = BuilderCatalog.GetComponentQuantity(request.DeviceType, category.Id);
                totalPrice += option.Price * quantity;
                lines.Add((category, option, quantity));
            }

            var missingRequired = BuilderCatalog.Categories
                .Where(category =>
                    category.Required
                    && category.Options.Any(option =>
                        option.DeviceTypes == null || option.DeviceTypes.Contains(request.DeviceType))
                    && !seenCategories.Contains(category.Id))
                .Select(category => category.NameEn)
                .ToArray();

            if (missingRequired.Length > 0)
            {
                return BadRequest($"Missing required component categories: {string.Join(", ", missingRequired)}");
            }

            var dbCategory = await _context.Categories.FirstOrDefaultAsync();
            if (dbCategory == null)
            {
                return StatusCode(500, "No category available for custom builds");
            }

            var deviceNameEn = BuilderCatalog.DeviceTypeNamesEn[request.DeviceType];
            var deviceNameHe = BuilderCatalog.DeviceTypeNamesHe[request.DeviceType];

            var specifications = lines.ToDictionary(
                l => l.Quantity > 1 ? $"{l.Category.NameEn} (x{l.Quantity})" : l.Category.NameEn,
                l => l.Option.NameEn);
            specifications["Device Type"] = deviceNameEn;

            var product = new Product
            {
                Name = $"Custom {deviceNameEn} Build",
                NameHebrew = $"הרכבה מותאמת אישית - {deviceNameHe}",
                Sku = $"CUSTOM-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}",
                Price = totalPrice,
                CategoryId = dbCategory.Id,
                ProductType = "custom-build",
                IsActive = false, // hidden from the public catalog
                InStock = true,
                StockQuantity = 1,
                Description = string.Join("; ", lines.Select(l =>
                    $"{(l.Quantity > 1 ? $"{l.Category.NameEn} (x{l.Quantity})" : l.Category.NameEn)}: {l.Option.NameEn}")),
                DescriptionHebrew = string.Join("; ", lines.Select(l =>
                    $"{(l.Quantity > 1 ? $"{l.Category.NameHe} (x{l.Quantity})" : l.Category.NameHe)}: {l.Option.NameHe}")),
                Specifications = specifications,
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating custom build product");
            return StatusCode(500, "An error occurred while creating the custom build");
        }
    }
}

public class CustomBuildRequest
{
    public required string DeviceType { get; set; }
    public List<CustomBuildPart> Parts { get; set; } = new();
}

public class CustomBuildPart
{
    public required string CategoryId { get; set; }
    public required string OptionId { get; set; }
}
