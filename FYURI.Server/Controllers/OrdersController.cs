using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using FYURI.Server.Models;
using FYURI.Server.Services;
using FYURI.Server.Data;

namespace FYURI.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private const int MaxQuantityPerItem = 99;

    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(AppDbContext context, IEmailService emailService, ILogger<OrdersController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpPost]
    [EnableRateLimiting("orders")]
    public async Task<ActionResult<OrderRequest>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            if (request.Items.Count == 0)
            {
                return BadRequest("An order must contain at least one item");
            }

            if (request.Items.Any(i => i.Quantity < 1 || i.Quantity > MaxQuantityPerItem))
            {
                return BadRequest($"Item quantities must be between 1 and {MaxQuantityPerItem}");
            }

            // Resolve every product server-side — names, SKUs and prices are
            // never taken from the client payload.
            var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            var orderItems = new List<OrderItem>();
            foreach (var item in request.Items)
            {
                if (!products.TryGetValue(item.ProductId, out var product))
                {
                    return BadRequest($"Product {item.ProductId} not found");
                }

                if (!product.IsActive && product.ProductType != "custom-build")
                {
                    return BadRequest($"Product '{product.Name}' is not available for purchase");
                }

                if (!product.InStock)
                {
                    return BadRequest($"Product '{product.Name}' is out of stock");
                }

                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ProductSku = product.Sku,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = item.Quantity * product.Price
                });
            }

            var orderNumber = $"FYURI-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

            var order = new OrderRequest
            {
                OrderNumber = orderNumber,
                CustomerName = request.CustomerName,
                CustomerEmail = request.CustomerEmail,
                CustomerPhone = request.CustomerPhone,
                CustomerAddress = request.CustomerAddress,
                CustomerCity = request.CustomerCity,
                CustomerNotes = request.CustomerNotes,
                Items = orderItems,
                TotalAmount = orderItems.Sum(i => i.TotalPrice),
                Status = OrderStatus.Pending
            };

            _context.OrderRequests.Add(order);
            await _context.SaveChangesAsync();

            // Email failures must never fail an order that is already saved.
            try
            {
                await _emailService.SendOrderNotificationToAdminAsync(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send admin notification for order {OrderNumber}", orderNumber);
            }

            try
            {
                await _emailService.SendOrderConfirmationToCustomerAsync(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send customer confirmation for order {OrderNumber}", orderNumber);
            }

            return Ok(order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating order");
            return StatusCode(500, "An error occurred while creating the order");
        }
    }

    [HttpGet("{orderNumber}")]
    public async Task<ActionResult<OrderConfirmationResponse>> GetOrder(string orderNumber)
    {
        try
        {
            var order = await _context.OrderRequests
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

            if (order == null)
            {
                return NotFound();
            }

            // This endpoint is anonymous (the confirmation page is reachable via a
            // guessable order number), so it must NOT expose customer PII such as
            // email, phone, or address. Full details are available to the customer
            // through the emailed confirmation and to staff via the admin API.
            var response = new OrderConfirmationResponse
            {
                OrderNumber = order.OrderNumber,
                Status = order.Status,
                CreatedDate = order.CreatedDate,
                TotalAmount = order.TotalAmount,
                Items = order.Items.Select(i => new OrderConfirmationItem
                {
                    ProductName = i.ProductName,
                    ProductSku = i.ProductSku,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice
                }).ToList()
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving order {OrderNumber}", orderNumber);
            return StatusCode(500, "An error occurred while retrieving the order");
        }
    }
}

public class OrderConfirmationResponse
{
    public required string OrderNumber { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedDate { get; set; }
    public decimal TotalAmount { get; set; }
    public List<OrderConfirmationItem> Items { get; set; } = new();
}

public class OrderConfirmationItem
{
    public required string ProductName { get; set; }
    public required string ProductSku { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class CreateOrderRequest
{
    [Required, MaxLength(200)]
    public required string CustomerName { get; set; }

    [Required, EmailAddress, MaxLength(200)]
    public required string CustomerEmail { get; set; }

    [Required, MaxLength(50)]
    public required string CustomerPhone { get; set; }

    [MaxLength(500)]
    public string? CustomerAddress { get; set; }

    [MaxLength(100)]
    public string? CustomerCity { get; set; }

    [MaxLength(2000)]
    public string? CustomerNotes { get; set; }

    [Required, MinLength(1)]
    public required List<CreateOrderItemRequest> Items { get; set; }
}

public class CreateOrderItemRequest
{
    public int ProductId { get; set; }

    [Range(1, 99)]
    public int Quantity { get; set; }
}
