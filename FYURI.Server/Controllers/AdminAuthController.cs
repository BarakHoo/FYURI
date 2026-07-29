using FYURI.Server.Data;
using FYURI.Server.Models;
using FYURI.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace FYURI.Server.Controllers;

[ApiController]
[Route("api/admin/auth")]
[EnableRateLimiting("auth")]
public class AdminAuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly ITotpService _totpService;
    private readonly ILogger<AdminAuthController> _logger;
    private const string SessionCookieName = "fyuri_admin_session";
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    public AdminAuthController(AppDbContext context, IJwtService jwtService, ITotpService totpService, ILogger<AdminAuthController> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _totpService = totpService;
        _logger = logger;
    }

    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class TwoFactorRequest
    {
        public required string PendingToken { get; set; }
        public required string Code { get; set; }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var admin = await _context.AdminUsers.FirstOrDefaultAsync(a => a.Email == request.Email);
        if (admin == null)
        {
            // Do not reveal whether the email exists
            return Unauthorized(new { message = "Invalid email or password" });
        }

        if (admin.LockoutUntil.HasValue && admin.LockoutUntil.Value > DateTime.UtcNow)
        {
            return StatusCode(423, new { message = "Account is temporarily locked. Please try again later." });
        }

        var hasher = new PasswordHasher<AdminUser>();
        var result = hasher.VerifyHashedPassword(admin, admin.PasswordHash, request.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            admin.FailedLoginAttempts++;
            if (admin.FailedLoginAttempts >= MaxFailedAttempts)
            {
                admin.LockoutUntil = DateTime.UtcNow.Add(LockoutDuration);
                admin.FailedLoginAttempts = 0;
            }
            await _context.SaveChangesAsync();
            return Unauthorized(new { message = "Invalid email or password" });
        }

        admin.FailedLoginAttempts = 0;
        admin.LockoutUntil = null;
        await _context.SaveChangesAsync();

        var pendingToken = _jwtService.GeneratePendingToken(admin);

        if (!admin.TotpEnabled)
        {
            // First-time login: generate a secret and QR code for enrollment
            var secret = _totpService.GenerateSecret();
            admin.TotpSecret = secret;
            await _context.SaveChangesAsync();

            var qrCode = _totpService.GenerateQrCodeDataUri(admin.Email, secret);

            return Ok(new
            {
                setupRequired = true,
                pendingToken,
                qrCode,
                secret
            });
        }

        return Ok(new
        {
            setupRequired = false,
            pendingToken
        });
    }

    [HttpPost("enable-2fa")]
    public async Task<IActionResult> EnableTwoFactor([FromBody] TwoFactorRequest request)
    {
        var principal = _jwtService.ValidatePendingToken(request.PendingToken);
        if (principal == null)
        {
            return Unauthorized(new { message = "Session expired. Please log in again." });
        }

        var email = principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var admin = await _context.AdminUsers.FirstOrDefaultAsync(a => a.Email == email);
        if (admin == null || string.IsNullOrEmpty(admin.TotpSecret))
        {
            return Unauthorized(new { message = "Session expired. Please log in again." });
        }

        if (!_totpService.ValidateCode(admin.TotpSecret, request.Code))
        {
            return BadRequest(new { message = "Invalid verification code" });
        }

        admin.TotpEnabled = true;
        admin.LastLoginDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        IssueSessionCookie(admin);

        return Ok(new { message = "2FA enabled successfully" });
    }

    [HttpPost("verify-2fa")]
    public async Task<IActionResult> VerifyTwoFactor([FromBody] TwoFactorRequest request)
    {
        var principal = _jwtService.ValidatePendingToken(request.PendingToken);
        if (principal == null)
        {
            return Unauthorized(new { message = "Session expired. Please log in again." });
        }

        var email = principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var admin = await _context.AdminUsers.FirstOrDefaultAsync(a => a.Email == email);
        if (admin == null || string.IsNullOrEmpty(admin.TotpSecret) || !admin.TotpEnabled)
        {
            return Unauthorized(new { message = "Session expired. Please log in again." });
        }

        if (!_totpService.ValidateCode(admin.TotpSecret, request.Code))
        {
            return BadRequest(new { message = "Invalid verification code" });
        }

        admin.LastLoginDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        IssueSessionCookie(admin);

        return Ok(new { message = "Login successful" });
    }

    [HttpGet("me")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminOnly")]
    public IActionResult Me()
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        return Ok(new { email });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(SessionCookieName);
        return Ok(new { message = "Logged out" });
    }

    private void IssueSessionCookie(AdminUser admin)
    {
        var token = _jwtService.GenerateAdminToken(admin);
        Response.Cookies.Append(SessionCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddHours(8)
        });
    }
}
