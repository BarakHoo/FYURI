using FYURI.Server.Data;
using FYURI.Server.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace FYURI.Server.Controllers;

[ApiController]
[Route("api/admin/customers")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminOnly")]
public class AdminCustomersController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminCustomersController(AppDbContext context)
    {
        _context = context;
    }

    public class CustomerUpdateRequest
    {
        [Required, MaxLength(200)]
        public required string Name { get; set; }
        [MaxLength(200)]
        public string? Company { get; set; }
        [MaxLength(200)]
        public string? Email { get; set; }
        [MaxLength(50)]
        public string? Phone { get; set; }
        [MaxLength(500)]
        public string? Address { get; set; }
        [MaxLength(100)]
        public string? City { get; set; }
        [MaxLength(8000)]
        public string? Notes { get; set; }
    }

    public class OwnedItemRequest
    {
        public int? ProductId { get; set; }
        [Required, MaxLength(300)]
        public required string Description { get; set; }
        [MaxLength(100)]
        public string? SerialNumber { get; set; }
        [MaxLength(2000)]
        public string? Notes { get; set; }
    }

    public class NoteRequest
    {
        [Required, MaxLength(4000)]
        public required string Text { get; set; }
    }

    public record CustomerSummary(
        int Id, string Name, string? Company, string? Email, string? Phone, string? City,
        int OrderCount, decimal TotalSpent, DateTime? LastOrderDate, DateTime CreatedDate, bool HasNotes);

    public record CustomerOrderSummary(
        int Id, string OrderNumber, DateTime CreatedDate, OrderStatus Status, decimal TotalAmount, int ItemCount);

    public record CustomerDetail(
        int Id, string Name, string? Company, string? Email, string? Phone, string? Address, string? City,
        string? Notes, DateTime CreatedDate, DateTime? LastOrderDate,
        List<CustomerOrderSummary> Orders, List<CustomerOwnedItem> OwnedItems, List<CustomerNote> NoteEntries);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerSummary>>> GetCustomers([FromQuery] string? search)
    {
        var query = _context.Customers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            var normalized = Customer.NormalizeText(s);
            var phone = Customer.NormalizePhone(s);
            query = query.Where(c =>
                c.NormalizedName.Contains(normalized) ||
                (c.NormalizedCompany != null && c.NormalizedCompany.Contains(normalized)) ||
                (c.NormalizedEmail != null && c.NormalizedEmail.Contains(s.ToLower())) ||
                (phone != null && c.NormalizedPhone != null && c.NormalizedPhone.Contains(phone)));
        }

        var customers = await query
            .OrderByDescending(c => c.LastOrderDate ?? c.CreatedDate)
            .Select(c => new CustomerSummary(
                c.Id, c.Name, c.Company, c.Email, c.Phone, c.City,
                c.Orders.Count,
                c.Orders.Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Rejected).Sum(o => o.TotalAmount),
                c.LastOrderDate, c.CreatedDate,
                (c.Notes != null && c.Notes != "") || c.NoteEntries.Any()))
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDetail>> GetCustomer(int id)
    {
        var customer = await _context.Customers
            .Include(c => c.OwnedItems)
                .ThenInclude(i => i.Product)
            .Include(c => c.NoteEntries)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null) return NotFound();

        // One-time migration: move legacy free-text notes into the log.
        if (!string.IsNullOrWhiteSpace(customer.Notes) && customer.NoteEntries.Count == 0)
        {
            customer.NoteEntries.Add(new CustomerNote
            {
                CustomerId = customer.Id,
                Text = customer.Notes.Trim(),
                Author = "Imported",
                CreatedDate = customer.CreatedDate,
            });
            customer.Notes = null;
            await _context.SaveChangesAsync();
        }

        var orders = await _context.OrderRequests
            .Where(o => o.CustomerId == id)
            .OrderByDescending(o => o.CreatedDate)
            .Select(o => new CustomerOrderSummary(o.Id, o.OrderNumber, o.CreatedDate, o.Status, o.TotalAmount, o.Items.Count))
            .ToListAsync();

        return Ok(new CustomerDetail(
            customer.Id, customer.Name, customer.Company, customer.Email, customer.Phone,
            customer.Address, customer.City, customer.Notes, customer.CreatedDate, customer.LastOrderDate,
            orders,
            customer.OwnedItems.OrderByDescending(i => i.AddedDate).ToList(),
            customer.NoteEntries.OrderByDescending(n => n.CreatedDate).ToList()));
    }

    [HttpPost("{id}/notes")]
    public async Task<ActionResult<CustomerNote>> AddNote(int id, [FromBody] NoteRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(new { message = "Note text is required" });

        if (!await _context.Customers.AnyAsync(c => c.Id == id)) return NotFound();

        var note = new CustomerNote
        {
            CustomerId = id,
            Text = request.Text.Trim(),
            Author = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
        };
        _context.CustomerNotes.Add(note);
        await _context.SaveChangesAsync();
        return Ok(note);
    }

    [HttpDelete("{id}/notes/{noteId}")]
    public async Task<IActionResult> DeleteNote(int id, int noteId)
    {
        var note = await _context.CustomerNotes.FirstOrDefaultAsync(n => n.Id == noteId && n.CustomerId == id);
        if (note == null) return NotFound();

        _context.CustomerNotes.Remove(note);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<Customer>> CreateCustomer([FromBody] CustomerUpdateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Name is required" });

        var duplicate = await FindDuplicateAsync(request, excludeId: null);
        if (duplicate != null)
        {
            return Conflict(new
            {
                message = $"A client with matching {duplicate.Value.Field} already exists: {duplicate.Value.Customer.Name}",
                existingCustomerId = duplicate.Value.Customer.Id,
                matchedField = duplicate.Value.Field
            });
        }

        var customer = new Customer
        {
            Name = request.Name.Trim(),
            NormalizedName = Customer.NormalizeText(request.Name),
        };
        Apply(customer, request);
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CustomerUpdateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Name is required" });

        var customer = await _context.Customers.FindAsync(id);
        if (customer == null) return NotFound();

        var duplicate = await FindDuplicateAsync(request, excludeId: id);
        if (duplicate != null)
        {
            return Conflict(new
            {
                message = $"Another client already uses this {duplicate.Value.Field}: {duplicate.Value.Customer.Name}",
                existingCustomerId = duplicate.Value.Customer.Id,
                matchedField = duplicate.Value.Field
            });
        }

        Apply(customer, request);
        await _context.SaveChangesAsync();
        return Ok(customer);
    }

    // Mirrors CustomerService.ResolveAsync matching order so admin-created records
    // can never collide with what checkout would auto-match.
    private async Task<(Customer Customer, string Field)?> FindDuplicateAsync(CustomerUpdateRequest request, int? excludeId)
    {
        var normEmail = Customer.NormalizeEmail(request.Email);
        var normPhone = Customer.NormalizePhone(request.Phone);
        var normCompany = Customer.NormalizeText(request.Company);
        var normName = Customer.NormalizeText(request.Name);

        var others = _context.Customers.Where(c => excludeId == null || c.Id != excludeId);

        if (normEmail != null)
        {
            var c = await others.FirstOrDefaultAsync(x => x.NormalizedEmail == normEmail);
            if (c != null) return (c, "email");
        }
        if (normPhone != null)
        {
            var c = await others.FirstOrDefaultAsync(x => x.NormalizedPhone == normPhone);
            if (c != null) return (c, "phone");
        }
        if (normCompany.Length > 0)
        {
            var c = await others.FirstOrDefaultAsync(x => x.NormalizedCompany == normCompany);
            if (c != null) return (c, "company");
        }
        if (normName.Length > 0)
        {
            var c = await others.FirstOrDefaultAsync(x => x.NormalizedName == normName);
            if (c != null) return (c, "name");
        }
        return null;
    }

    [HttpPost("{id}/items")]
    public async Task<ActionResult<CustomerOwnedItem>> AddOwnedItem(int id, [FromBody] OwnedItemRequest request)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null) return NotFound();

        if (request.ProductId is int pid && !await _context.Products.AnyAsync(p => p.Id == pid))
            return BadRequest("Product not found");

        var item = new CustomerOwnedItem
        {
            CustomerId = id,
            ProductId = request.ProductId,
            Description = request.Description.Trim(),
            SerialNumber = string.IsNullOrWhiteSpace(request.SerialNumber) ? null : request.SerialNumber.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
        };
        _context.CustomerOwnedItems.Add(item);
        await _context.SaveChangesAsync();

        await _context.Entry(item).Reference(i => i.Product).LoadAsync();
        return Ok(item);
    }

    [HttpDelete("{id}/items/{itemId}")]
    public async Task<IActionResult> RemoveOwnedItem(int id, int itemId)
    {
        var item = await _context.CustomerOwnedItems.FirstOrDefaultAsync(i => i.Id == itemId && i.CustomerId == id);
        if (item == null) return NotFound();

        _context.CustomerOwnedItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Convenience: add every product from an order to the client's owned equipment.
    [HttpPost("{id}/items/from-order/{orderId}")]
    public async Task<ActionResult<IEnumerable<CustomerOwnedItem>>> AddItemsFromOrder(int id, int orderId)
    {
        var order = await _context.OrderRequests
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.CustomerId == id);
        if (order == null) return NotFound();

        var items = order.Items.Select(i => new CustomerOwnedItem
        {
            CustomerId = id,
            ProductId = i.ProductId,
            Description = i.Quantity > 1 ? $"{i.ProductName} ×{i.Quantity}" : i.ProductName,
            Notes = $"From order {order.OrderNumber}",
        }).ToList();

        _context.CustomerOwnedItems.AddRange(items);
        await _context.SaveChangesAsync();
        return Ok(items);
    }

    private static void Apply(Customer customer, CustomerUpdateRequest request)
    {
        customer.Name = request.Name.Trim();
        customer.NormalizedName = Customer.NormalizeText(request.Name);
        customer.Company = string.IsNullOrWhiteSpace(request.Company) ? null : request.Company.Trim();
        customer.NormalizedCompany = string.IsNullOrWhiteSpace(request.Company) ? null : Customer.NormalizeText(request.Company);
        customer.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        customer.NormalizedEmail = Customer.NormalizeEmail(request.Email);
        customer.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        customer.NormalizedPhone = Customer.NormalizePhone(request.Phone);
        customer.Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim();
        customer.City = string.IsNullOrWhiteSpace(request.City) ? null : request.City.Trim();
        customer.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
    }
}
