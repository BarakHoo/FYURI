using FYURI.Server.Data;
using FYURI.Server.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace FYURI.Server.Controllers;

[ApiController]
[Route("api/admin/orders")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminOnly")]
public class AdminOrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<AdminOrdersController> _logger;

    public AdminOrdersController(AppDbContext context, ILogger<AdminOrdersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    public class OrderUpdateRequest
    {
        [Required]
        public OrderStatus Status { get; set; }
        public string? AdminNotes { get; set; }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderRequest>>> GetOrders()
    {
        var orders = await _context.OrderRequests
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedDate)
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderRequest>> GetOrder(int id)
    {
        var order = await _context.OrderRequests
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound();
        }

        return Ok(order);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderUpdateRequest request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Invalid model state for order update: {ModelState}", ModelState);
            return BadRequest(ModelState);
        }

        var order = await _context.OrderRequests.FindAsync(id);
        if (order == null)
        {
            return NotFound();
        }

        _logger.LogInformation("Updating order {OrderId} to status {Status}", id, request.Status);

        order.Status = request.Status;
        order.AdminNotes = request.AdminNotes;

        if (request.Status == OrderStatus.Contacted && order.ContactedDate == null)
        {
            order.ContactedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(order);
    }
}
