namespace FYURI.Server.Models;

public class CartItem
{
    public int Id { get; set; }
    public required string SessionId { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int Quantity { get; set; }
    public decimal PriceAtAddTime { get; set; }
    public DateTime AddedDate { get; set; } = DateTime.UtcNow;
}
