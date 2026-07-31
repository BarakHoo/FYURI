using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using FYURI.Server.Models;
using FYURI.Server.Data;

namespace FYURI.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("cart")]
public class CartController : ControllerBase
{
    private const int MaxQuantityPerItem = 99;

    private readonly AppDbContext _context;
    private readonly ILogger<CartController> _logger;

    public CartController(AppDbContext context, ILogger<CartController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("{sessionId}")]
    public async Task<ActionResult<IEnumerable<CartItem>>> GetCart(string sessionId)
    {
        try
        {
            var cart = await _context.CartItems
                .Include(c => c.Product)
                .Where(c => c.SessionId == sessionId)
                .ToListAsync();

            return Ok(cart);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving cart for session {SessionId}", sessionId);
            return StatusCode(500, "An error occurred while retrieving the cart");
        }
    }

    [HttpPost("{sessionId}/items")]
    public async Task<ActionResult<CartItem>> AddToCart(string sessionId, [FromBody] AddToCartRequest request)
    {
        try
        {
            if (request.Quantity < 1 || request.Quantity > MaxQuantityPerItem)
            {
                return BadRequest($"Quantity must be between 1 and {MaxQuantityPerItem}");
            }

            // Always resolve the product server-side; never trust the client price.
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId);
            if (product == null)
            {
                return BadRequest("Product not found");
            }

            // Only publicly listed products or hidden custom builds may be carted.
            if (!product.IsActive && product.ProductType != "custom-build")
            {
                return BadRequest("Product is not available for purchase");
            }

            var availableStock = Math.Max(0, product.StockQuantity);
            if (!product.InStock || availableStock == 0)
            {
                return BadRequest("Product is out of stock");
            }

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(item => item.SessionId == sessionId && item.ProductId == request.ProductId);

            if (existingItem != null)
            {
                var requestedQuantity = existingItem.Quantity + request.Quantity;
                if (requestedQuantity > MaxQuantityPerItem)
                {
                    return BadRequest($"Quantity must be between 1 and {MaxQuantityPerItem}");
                }

                if (requestedQuantity > availableStock)
                {
                    return BadRequest($"Only {availableStock} unit(s) of '{product.Name}' are available");
                }

                existingItem.Quantity = requestedQuantity;
                existingItem.PriceAtAddTime = product.Price;
                await _context.SaveChangesAsync();
                return Ok(existingItem);
            }

            if (request.Quantity > availableStock)
            {
                return BadRequest($"Only {availableStock} unit(s) of '{product.Name}' are available");
            }

            var newItem = new CartItem
            {
                SessionId = sessionId,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                PriceAtAddTime = product.Price
            };

            _context.CartItems.Add(newItem);
            await _context.SaveChangesAsync();

            return Ok(newItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding item to cart");
            return StatusCode(500, "An error occurred while adding to cart");
        }
    }

    [HttpPut("{sessionId}/items/{itemId}")]
    public async Task<ActionResult<CartItem>> UpdateCartItem(string sessionId, int itemId, [FromBody] UpdateCartItemRequest request)
    {
        try
        {
            var item = await _context.CartItems
                .Include(i => i.Product)
                .FirstOrDefaultAsync(i => i.Id == itemId && i.SessionId == sessionId);

            if (item == null)
            {
                return NotFound();
            }

            if (request.Quantity < 1 || request.Quantity > MaxQuantityPerItem)
            {
                return BadRequest($"Quantity must be between 1 and {MaxQuantityPerItem}");
            }

            if (item.Product == null)
            {
                return BadRequest("Product not found");
            }

            if (!item.Product.IsActive && item.Product.ProductType != "custom-build")
            {
                return BadRequest("Product is not available for purchase");
            }

            var availableStock = Math.Max(0, item.Product.StockQuantity);
            if (!item.Product.InStock || availableStock == 0)
            {
                return BadRequest("Product is out of stock");
            }

            if (request.Quantity > availableStock)
            {
                return BadRequest($"Only {availableStock} unit(s) of '{item.Product.Name}' are available");
            }

            item.Quantity = request.Quantity;
            await _context.SaveChangesAsync();

            return Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cart item {ItemId}", itemId);
            return StatusCode(500, "An error occurred while updating the cart");
        }
    }

    [HttpDelete("{sessionId}/items/{itemId}")]
    public async Task<IActionResult> RemoveFromCart(string sessionId, int itemId)
    {
        try
        {
            var item = await _context.CartItems
                .FirstOrDefaultAsync(i => i.Id == itemId && i.SessionId == sessionId);

            if (item == null)
            {
                return NotFound();
            }

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cart item {ItemId}", itemId);
            return StatusCode(500, "An error occurred while removing from cart");
        }
    }

    [HttpDelete("{sessionId}")]
    public async Task<IActionResult> ClearCart(string sessionId)
    {
        try
        {
            var items = await _context.CartItems
                .Where(i => i.SessionId == sessionId)
                .ToListAsync();

            _context.CartItems.RemoveRange(items);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cart for session {SessionId}", sessionId);
            return StatusCode(500, "An error occurred while clearing the cart");
        }
    }
}

public class AddToCartRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateCartItemRequest
{
    public int Quantity { get; set; }
}
