using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using FYURI.Server.Data;
using FYURI.Server.Models;
using FYURI.Server.Services;

namespace FYURI.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<ContactController> _logger;

    public ContactController(AppDbContext context, IEmailService emailService, ILogger<ContactController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpPost]
    [EnableRateLimiting("contact")]
    public async Task<IActionResult> Submit([FromBody] ContactMessageRequest request)
    {
        try
        {
            _context.ContactMessages.Add(new ContactMessage
            {
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Message = request.Message,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving contact message from {Email}", request.Email);
            return StatusCode(500, "An error occurred while sending your message");
        }

        try
        {
            await _emailService.SendContactMessageToAdminAsync(request.Name, request.Email, request.Phone, request.Message);
        }
        catch (Exception ex)
        {
            // Message is already persisted; don't fail the request if email delivery has issues
            _logger.LogError(ex, "Error emailing contact message from {Email}", request.Email);
        }

        return Ok(new { message = "Message sent" });
    }
}

public class ContactMessageRequest
{
    [Required, MaxLength(100)]
    public required string Name { get; set; }

    [Required, EmailAddress, MaxLength(200)]
    public required string Email { get; set; }

    [MaxLength(30)]
    public string? Phone { get; set; }

    [Required, MaxLength(4000)]
    public required string Message { get; set; }
}
