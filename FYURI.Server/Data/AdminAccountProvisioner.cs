using System.Net.Mail;
using FYURI.Server.Models;
using Microsoft.AspNetCore.Identity;

namespace FYURI.Server.Data;

internal sealed class AdminAccountConfigurationException : InvalidOperationException
{
    public AdminAccountConfigurationException(string message) : base(message)
    {
    }
}

internal static class AdminAccountProvisioner
{
    internal const int MinimumPasswordLength = 12;
    private const string PlaceholderEmail = "your-admin@example.com";
    private static readonly HashSet<string> RejectedSamplePasswords = new(StringComparer.OrdinalIgnoreCase)
    {
        "choose-a-strong-password",
        "a-strong-password",
        "choose-a-unique-password-of-at-least-12-characters",
        "a-unique-password-of-at-least-12-characters",
        "dev-only-password"
    };

    internal static void EnsureProvisioned(
        AppDbContext context,
        IConfiguration configuration,
        bool allowDevelopmentCredentials = false)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentNullException.ThrowIfNull(configuration);

        // Bootstrap settings are deliberately ignored after the account exists.
        // Password rotation must use the explicit one-shot reset command.
        if (GetSoleAdmin(context) is not null)
        {
            return;
        }

        var (email, password) = ReadAndValidateCredentials(
            configuration,
            allowDevelopmentCredentials);
        var admin = new AdminUser
        {
            Email = email,
            PasswordHash = string.Empty
        };

        admin.PasswordHash = new PasswordHasher<AdminUser>().HashPassword(admin, password);
        context.AdminUsers.Add(admin);
        context.SaveChanges();
    }

    internal static void Reset(
        AppDbContext context,
        IConfiguration configuration,
        bool allowDevelopmentCredentials = false)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentNullException.ThrowIfNull(configuration);

        var admin = GetSoleAdmin(context)
            ?? throw new AdminAccountConfigurationException(
                "The admin account cannot be reset because no administrator exists. Start the application normally to provision the initial account.");

        // Validate everything before mutating the tracked entity so a rejected
        // reset cannot leave partially changed credentials in the context.
        var (email, password) = ReadAndValidateCredentials(
            configuration,
            allowDevelopmentCredentials);
        var passwordHash = new PasswordHasher<AdminUser>().HashPassword(admin, password);

        admin.Email = email;
        admin.PasswordHash = passwordHash;
        admin.TotpSecret = null;
        admin.TotpEnabled = false;
        admin.LastLoginDate = null;
        admin.FailedLoginAttempts = 0;
        admin.LockoutUntil = null;

        context.SaveChanges();
    }

    private static AdminUser? GetSoleAdmin(AppDbContext context)
    {
        var admins = context.AdminUsers
            .OrderBy(admin => admin.Id)
            .Take(2)
            .ToList();

        if (admins.Count > 1)
        {
            throw new AdminAccountConfigurationException(
                "More than one administrator exists. Resolve the duplicate accounts before provisioning or resetting credentials.");
        }

        return admins.SingleOrDefault();
    }

    private static (string Email, string Password) ReadAndValidateCredentials(
        IConfiguration configuration,
        bool allowDevelopmentCredentials)
    {
        var email = configuration["AdminAccount:Email"]?.Trim();
        var password = configuration["AdminAccount:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            throw new AdminAccountConfigurationException(
                "AdminAccount:Email and AdminAccount:Password are required for initial provisioning and explicit account resets.");
        }

        if (!MailAddress.TryCreate(email, out var parsedEmail)
            || !string.Equals(parsedEmail.Address, email, StringComparison.OrdinalIgnoreCase)
            || email.Length > AdminUser.MaximumEmailLength
            || string.Equals(email, PlaceholderEmail, StringComparison.OrdinalIgnoreCase))
        {
            throw new AdminAccountConfigurationException(
                "AdminAccount:Email must be a valid, non-placeholder email address.");
        }

        if (password.Length < MinimumPasswordLength
            || (!allowDevelopmentCredentials && RejectedSamplePasswords.Contains(password)))
        {
            throw new AdminAccountConfigurationException(
                $"AdminAccount:Password must contain at least {MinimumPasswordLength} characters and must not be a documented sample value.");
        }

        return (email, password);
    }
}
