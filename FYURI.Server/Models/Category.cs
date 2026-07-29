namespace FYURI.Server.Models;

public class Category
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string NameHebrew { get; set; }
    public string? Description { get; set; }
    public string? DescriptionHebrew { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
