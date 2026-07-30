using FYURI.Server.Data;
using FYURI.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace FYURI.Server.Tests;

public sealed class AdminAccountProvisionerTests
{
    private const string InitialEmail = "owner@fyuri.test";
    private const string InitialPassword = "initial-password-2026";
    private readonly DbContextOptions<AppDbContext> _options;

    public AdminAccountProvisionerTests()
    {
        var databaseRoot = new InMemoryDatabaseRoot();
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(
                $"admin-account-provisioner-{Guid.NewGuid()}",
                databaseRoot)
            .Options;

        using var context = CreateContext();
        context.Database.EnsureCreated();
    }

    [Fact]
    public void EmptyDatabase_WithValidCredentials_CreatesHashedAdmin()
    {
        using (var context = CreateContext())
        {
            AdminAccountProvisioner.EnsureProvisioned(
                context,
                Configuration(InitialEmail, InitialPassword));
        }

        using var verificationContext = CreateContext();
        var admin = Assert.Single(verificationContext.AdminUsers);

        Assert.Equal(InitialEmail, admin.Email);
        Assert.NotEqual(InitialPassword, admin.PasswordHash);
        Assert.Equal(
            PasswordVerificationResult.Success,
            new PasswordHasher<AdminUser>().VerifyHashedPassword(
                admin,
                admin.PasswordHash,
                InitialPassword));
    }

    [Theory]
    [InlineData(null, InitialPassword)]
    [InlineData("", InitialPassword)]
    [InlineData("your-admin@example.com", InitialPassword)]
    [InlineData("not-an-email", InitialPassword)]
    [InlineData(InitialEmail, null)]
    [InlineData(InitialEmail, "admin")]
    [InlineData(InitialEmail, "choose-a-strong-password")]
    [InlineData(InitialEmail, "a-unique-password-of-at-least-12-characters")]
    [InlineData(InitialEmail, "DEV-ONLY-PASSWORD")]
    public void EmptyDatabase_WithInvalidCredentials_FailsWithoutCreatingAdmin(
        string? email,
        string? password)
    {
        using (var context = CreateContext())
        {
            Assert.Throws<AdminAccountConfigurationException>(() =>
                AdminAccountProvisioner.EnsureProvisioned(
                    context,
                    Configuration(email, password)));
        }

        using var verificationContext = CreateContext();
        Assert.Empty(verificationContext.AdminUsers);
    }

    [Fact]
    public void EmptyDatabase_WithEmailBeyondDatabaseLimit_FailsWithoutCreatingAdmin()
    {
        var email = $"{new string('a', AdminUser.MaximumEmailLength)}@fyuri.test";

        using (var context = CreateContext())
        {
            Assert.Throws<AdminAccountConfigurationException>(() =>
                AdminAccountProvisioner.EnsureProvisioned(
                    context,
                    Configuration(email, InitialPassword)));
        }

        using var verificationContext = CreateContext();
        Assert.Empty(verificationContext.AdminUsers);
    }

    [Fact]
    public void DevelopmentCredentials_RequireExplicitDevelopmentOptIn()
    {
        using (var context = CreateContext())
        {
            AdminAccountProvisioner.EnsureProvisioned(
                context,
                Configuration("developer@fyuri.local", "dev-only-password"),
                allowDevelopmentCredentials: true);
        }

        using var verificationContext = CreateContext();
        Assert.Equal("developer@fyuri.local", Assert.Single(verificationContext.AdminUsers).Email);
    }

    [Fact]
    public void OrdinaryRestart_PreservesExistingAdminAndIgnoresBootstrapConfiguration()
    {
        var expected = SeedExistingAdmin();

        using (var changedConfigurationContext = CreateContext())
        {
            AdminAccountProvisioner.EnsureProvisioned(
                changedConfigurationContext,
                Configuration("changed@fyuri.test", "changed-password-2026"));
        }
        AssertAdminMatches(expected);

        using (var missingConfigurationContext = CreateContext())
        {
            AdminAccountProvisioner.EnsureProvisioned(
                missingConfigurationContext,
                Configuration(null, null));
        }
        AssertAdminMatches(expected);
    }

    [Fact]
    public void ExplicitReset_ReplacesCredentialsAndClearsSecurityState()
    {
        var original = SeedExistingAdmin();
        const string replacementEmail = "replacement@fyuri.test";
        const string replacementPassword = "replacement-password-2026";

        using (var context = CreateContext())
        {
            AdminAccountProvisioner.Reset(
                context,
                Configuration(replacementEmail, replacementPassword));
        }

        using var verificationContext = CreateContext();
        var admin = Assert.Single(verificationContext.AdminUsers);
        var hasher = new PasswordHasher<AdminUser>();

        Assert.Equal(original.Id, admin.Id);
        Assert.Equal(original.CreatedDate, admin.CreatedDate);
        Assert.Equal(replacementEmail, admin.Email);
        Assert.Equal(
            PasswordVerificationResult.Failed,
            hasher.VerifyHashedPassword(admin, admin.PasswordHash, InitialPassword));
        Assert.Equal(
            PasswordVerificationResult.Success,
            hasher.VerifyHashedPassword(admin, admin.PasswordHash, replacementPassword));
        Assert.False(admin.TotpEnabled);
        Assert.Null(admin.TotpSecret);
        Assert.Null(admin.LastLoginDate);
        Assert.Equal(0, admin.FailedLoginAttempts);
        Assert.Null(admin.LockoutUntil);
    }

    [Fact]
    public void ExplicitReset_WithInvalidCredentials_IsAtomic()
    {
        var expected = SeedExistingAdmin();

        using (var context = CreateContext())
        {
            Assert.Throws<AdminAccountConfigurationException>(() =>
                AdminAccountProvisioner.Reset(
                    context,
                    Configuration("replacement@fyuri.test", "short")));
        }

        AssertAdminMatches(expected);
    }

    [Fact]
    public void ExplicitReset_WithoutExistingAdmin_FailsWithoutCreatingOne()
    {
        using (var context = CreateContext())
        {
            Assert.Throws<AdminAccountConfigurationException>(() =>
                AdminAccountProvisioner.Reset(
                    context,
                    Configuration(InitialEmail, InitialPassword)));
        }

        using var verificationContext = CreateContext();
        Assert.Empty(verificationContext.AdminUsers);
    }

    [Fact]
    public void MultipleAdmins_FailVisiblyInsteadOfMutatingAnArbitraryAccount()
    {
        using (var context = CreateContext())
        {
            context.AdminUsers.AddRange(
                CreateAdmin("first@fyuri.test", "first-password-2026"),
                CreateAdmin("second@fyuri.test", "second-password-2026"));
            context.SaveChanges();
        }

        using var verificationContext = CreateContext();
        Assert.Throws<AdminAccountConfigurationException>(() =>
            AdminAccountProvisioner.EnsureProvisioned(
                verificationContext,
                Configuration(null, null)));
    }

    [Theory]
    [InlineData("reset-admin")]
    [InlineData("RESET-ADMIN")]
    public void ResetCommand_RequiresTheExactSingleCommand(string command)
    {
        Assert.True(AdminAccountCommand.IsReset([command]));
        Assert.False(AdminAccountCommand.IsReset([]));
        Assert.False(AdminAccountCommand.IsReset(["--urls", "http://localhost:8080"]));
    }

    [Theory]
    [InlineData("reset-admin", "--urls")]
    [InlineData("--urls", "reset-admin")]
    [InlineData("reset-admin", "reset-admin")]
    public void ResetCommand_RejectsMixedOrRepeatedArguments(
        string first,
        string second)
    {
        Assert.Throws<InvalidOperationException>(() =>
            AdminAccountCommand.IsReset([first, second]));
    }

    private AppDbContext CreateContext() => new(_options);

    private AdminSnapshot SeedExistingAdmin()
    {
        var admin = CreateAdmin(InitialEmail, InitialPassword);
        admin.TotpSecret = "existing-totp-secret";
        admin.TotpEnabled = true;
        admin.LastLoginDate = new DateTime(2026, 7, 29, 18, 30, 0, DateTimeKind.Utc);
        admin.CreatedDate = new DateTime(2026, 7, 28, 12, 0, 0, DateTimeKind.Utc);
        admin.FailedLoginAttempts = 4;
        admin.LockoutUntil = new DateTime(2026, 7, 30, 10, 0, 0, DateTimeKind.Utc);

        using (var context = CreateContext())
        {
            context.AdminUsers.Add(admin);
            context.SaveChanges();
        }

        return AdminSnapshot.From(admin);
    }

    private static AdminUser CreateAdmin(string email, string password)
    {
        var admin = new AdminUser
        {
            Email = email,
            PasswordHash = string.Empty
        };
        admin.PasswordHash = new PasswordHasher<AdminUser>().HashPassword(admin, password);
        return admin;
    }

    private void AssertAdminMatches(AdminSnapshot expected)
    {
        using var context = CreateContext();
        var actual = Assert.Single(context.AdminUsers);

        Assert.Equal(expected.Id, actual.Id);
        Assert.Equal(expected.Email, actual.Email);
        Assert.Equal(expected.PasswordHash, actual.PasswordHash);
        Assert.Equal(expected.TotpSecret, actual.TotpSecret);
        Assert.Equal(expected.TotpEnabled, actual.TotpEnabled);
        Assert.Equal(expected.LastLoginDate, actual.LastLoginDate);
        Assert.Equal(expected.CreatedDate, actual.CreatedDate);
        Assert.Equal(expected.FailedLoginAttempts, actual.FailedLoginAttempts);
        Assert.Equal(expected.LockoutUntil, actual.LockoutUntil);
    }

    private static IConfiguration Configuration(string? email, string? password)
    {
        var values = new Dictionary<string, string?>();
        if (email is not null)
        {
            values["AdminAccount:Email"] = email;
        }
        if (password is not null)
        {
            values["AdminAccount:Password"] = password;
        }

        return new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
    }

    private sealed record AdminSnapshot(
        int Id,
        string Email,
        string PasswordHash,
        string? TotpSecret,
        bool TotpEnabled,
        DateTime? LastLoginDate,
        DateTime CreatedDate,
        int FailedLoginAttempts,
        DateTime? LockoutUntil)
    {
        internal static AdminSnapshot From(AdminUser admin) => new(
            admin.Id,
            admin.Email,
            admin.PasswordHash,
            admin.TotpSecret,
            admin.TotpEnabled,
            admin.LastLoginDate,
            admin.CreatedDate,
            admin.FailedLoginAttempts,
            admin.LockoutUntil);
    }
}
