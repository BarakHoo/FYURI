using FYURI.Server.Data;
using FYURI.Server.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FYURI.Server.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminOnly")]
public class AdminProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<AdminProductsController> _logger;

    public AdminProductsController(AppDbContext context, ILogger<AdminProductsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    public class ProductUpsertRequest
    {
        public required string Name { get; set; }
        public required string NameHebrew { get; set; }
        public string? Description { get; set; }
        public string? DescriptionHebrew { get; set; }
        public required string Sku { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public string? ProductType { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public string? ThumbnailUrl { get; set; }
        public bool InStock { get; set; } = true;
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Generation { get; set; }
        public string? Resolution { get; set; }
        public string? Fom { get; set; }
        public string? TubeType { get; set; }
        public Dictionary<string, string> Specifications { get; set; } = new();
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .OrderByDescending(p => p.CreatedDate)
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct([FromBody] ProductUpsertRequest request)
    {
        var product = new Product
        {
            Name = request.Name,
            NameHebrew = request.NameHebrew,
            Description = request.Description,
            DescriptionHebrew = request.DescriptionHebrew,
            Sku = request.Sku,
            Price = request.Price,
            CategoryId = request.CategoryId,
            ProductType = request.ProductType,
            ImageUrls = request.ImageUrls,
            ThumbnailUrl = request.ThumbnailUrl,
            InStock = request.InStock,
            StockQuantity = request.StockQuantity,
            IsActive = request.IsActive,
            Generation = request.Generation,
            Resolution = request.Resolution,
            Fom = request.Fom,
            TubeType = request.TubeType,
            Specifications = request.Specifications,
            CreatedDate = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductUpsertRequest request)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound();
        }

        product.Name = request.Name;
        product.NameHebrew = request.NameHebrew;
        product.Description = request.Description;
        product.DescriptionHebrew = request.DescriptionHebrew;
        product.Sku = request.Sku;
        product.Price = request.Price;
        product.CategoryId = request.CategoryId;
        product.ProductType = request.ProductType;
        product.ImageUrls = request.ImageUrls;
        product.ThumbnailUrl = request.ThumbnailUrl;
        product.InStock = request.InStock;
        product.StockQuantity = request.StockQuantity;
        product.IsActive = request.IsActive;
        product.Generation = request.Generation;
        product.Resolution = request.Resolution;
        product.Fom = request.Fom;
        product.TubeType = request.TubeType;
        product.Specifications = request.Specifications;

        await _context.SaveChangesAsync();

        return Ok(product);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound();
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        var categories = await _context.Categories
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();

        return Ok(categories);
    }
}
