using System.Security.Claims;
using FYURI.Server.Models;

namespace FYURI.Server.Services;

public interface IJwtService
{
    string GenerateAdminToken(AdminUser admin);
    string GeneratePendingToken(AdminUser admin);
    ClaimsPrincipal? ValidatePendingToken(string token);
}
