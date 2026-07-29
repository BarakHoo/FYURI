using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace FYURI.Server.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminOnly")]
public class ImageUploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ImageUploadController> _logger;
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

    /// <summary>
    /// Verifies the file content actually matches a supported image format (magic bytes),
    /// so renamed HTML/scripts or mislabeled formats (e.g. HEIC renamed to .jpg) are rejected.
    /// </summary>
    private static async Task<bool> HasValidImageSignatureAsync(IFormFile file)
    {
        var header = new byte[12];
        using var stream = file.OpenReadStream();
        var read = await stream.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false);
        if (read < 12) return false;

        // JPEG: FF D8 FF
        if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF) return true;
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47
            && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A) return true;
        // WebP: "RIFF" .... "WEBP"
        if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
            && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50) return true;

        return false;
    }

    public ImageUploadController(IWebHostEnvironment environment, ILogger<ImageUploadController> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    [HttpPost("product")]
    public async Task<ActionResult<string>> UploadProductImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        if (file.Length > MaxFileSize)
        {
            return BadRequest($"File size exceeds {MaxFileSize / 1024 / 1024}MB limit");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest($"Invalid file type. Allowed: {string.Join(", ", AllowedExtensions)}");
        }

        if (!await HasValidImageSignatureAsync(file))
        {
            return BadRequest("File content is not a valid JPEG, PNG or WebP image.");
        }

        try
        {
            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{extension}";
            var uploadsPath = Path.Combine(_environment.ContentRootPath, "wwwroot", "images", "products");

            // Ensure directory exists
            Directory.CreateDirectory(uploadsPath);

            var filePath = Path.Combine(uploadsPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return web path
            var webPath = $"/images/products/{fileName}";
            _logger.LogInformation("Image uploaded successfully: {WebPath}", webPath);

            return Ok(new { url = webPath });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image");
            return StatusCode(500, "Error uploading image");
        }
    }

    [HttpPost("banner")]
    public async Task<ActionResult<string>> UploadBannerImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        if (file.Length > MaxFileSize)
        {
            return BadRequest($"File size exceeds {MaxFileSize / 1024 / 1024}MB limit");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest($"Invalid file type. Allowed: {string.Join(", ", AllowedExtensions)}");
        }

        if (!await HasValidImageSignatureAsync(file))
        {
            return BadRequest("File content is not a valid JPEG, PNG or WebP image.");
        }

        try
        {
            var fileName = $"{Guid.NewGuid()}{extension}";
            var uploadsPath = Path.Combine(_environment.ContentRootPath, "wwwroot", "images", "banners");

            Directory.CreateDirectory(uploadsPath);

            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var webPath = $"/images/banners/{fileName}";
            _logger.LogInformation("Banner image uploaded successfully: {WebPath}", webPath);

            return Ok(new { url = webPath });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading banner image");
            return StatusCode(500, "Error uploading banner image");
        }
    }
}
