namespace FYURI.Server.Models;

public class AdminUser
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string? TotpSecret { get; set; }
    public bool TotpEnabled { get; set; } = false;
    // Last accepted TOTP time step; prevents a code from being replayed within its validity window
    public long? LastTotpTimeStep { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    // Simple lockout support for brute-force mitigation
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockoutUntil { get; set; }
}
