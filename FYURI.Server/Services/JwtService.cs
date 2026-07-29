using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FYURI.Server.Models;
using Microsoft.IdentityModel.Tokens;

namespace FYURI.Server.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    private SymmetricSecurityKey GetSigningKey()
    {
        var secret = _config["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret is not configured");
        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
    }

    public string GenerateAdminToken(AdminUser admin)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, admin.Id.ToString()),
            new(ClaimTypes.Email, admin.Email),
            new(ClaimTypes.Role, "Admin"),
            new("stage", "authenticated")
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "FYURI",
            audience: _config["Jwt:Audience"] ?? "FYURI",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: new SigningCredentials(GetSigningKey(), SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GeneratePendingToken(AdminUser admin)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, admin.Id.ToString()),
            new(ClaimTypes.Email, admin.Email),
            new("stage", "pending-2fa")
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "FYURI",
            audience: _config["Jwt:Audience"] ?? "FYURI",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: new SigningCredentials(GetSigningKey(), SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? ValidatePendingToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _config["Jwt:Issuer"] ?? "FYURI",
            ValidateAudience = true,
            ValidAudience = _config["Jwt:Audience"] ?? "FYURI",
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = GetSigningKey(),
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        try
        {
            var principal = handler.ValidateToken(token, parameters, out _);
            var stage = principal.FindFirst("stage")?.Value;
            return stage == "pending-2fa" ? principal : null;
        }
        catch
        {
            return null;
        }
    }
}
