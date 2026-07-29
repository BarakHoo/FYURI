namespace FYURI.Server.Models;

public class Product
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string NameHebrew { get; set; }
    public string? Description { get; set; }
    public string? DescriptionHebrew { get; set; }
    public required string Sku { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public string? ThumbnailUrl { get; set; }
    public bool InStock { get; set; } = true;
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    // Night vision specific properties
    public string? ProductType { get; set; } // e.g., monocular, binocular, panoramic, intensifier, optics, accessories
    public string? Generation { get; set; } // Gen2+, Gen3, etc.
    public string? Resolution { get; set; }
    public string? Fom { get; set; } // Figure of Merit
    public string? TubeType { get; set; }
    public Dictionary<string, string> Specifications { get; set; } = new();
}
