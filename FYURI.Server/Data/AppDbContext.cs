using Microsoft.EntityFrameworkCore;
using FYURI.Server.Models;

namespace FYURI.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<OrderRequest> OrderRequests { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<AdminUser> AdminUsers { get; set; }
    public DbSet<ContactMessage> ContactMessages { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<CustomerOwnedItem> CustomerOwnedItems { get; set; }
    public DbSet<CustomerNote> CustomerNotes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Category configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NameHebrew).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.DescriptionHebrew).HasMaxLength(500);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
        });

        // Product configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.NameHebrew).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.DescriptionHebrew).HasMaxLength(2000);
            entity.Property(e => e.Sku).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ThumbnailUrl).HasMaxLength(500);
            entity.Property(e => e.Generation).HasMaxLength(50);
            entity.Property(e => e.Resolution).HasMaxLength(100);
            entity.Property(e => e.Fom).HasMaxLength(100);
            entity.Property(e => e.TubeType).HasMaxLength(100);

            // Convert list to JSON for storage
            entity.Property(e => e.ImageUrls)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );

            entity.Property(e => e.Specifications)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, string>()
                );

            entity.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // CartItem configuration
        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SessionId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PriceAtAddTime).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.SessionId);
        });

        // OrderRequest configuration
        modelBuilder.Entity<OrderRequest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CustomerCompany).HasMaxLength(200);
            entity.Property(e => e.CustomerEmail).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CustomerPhone).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CustomerAddress).HasMaxLength(500);
            entity.Property(e => e.CustomerCity).HasMaxLength(100);
            entity.Property(e => e.CustomerNotes).HasMaxLength(2000);
            entity.Property(e => e.AdminNotes).HasMaxLength(2000);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");

            entity.HasMany(e => e.Items)
                .WithOne()
                .HasForeignKey(e => e.OrderRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.HasIndex(e => e.CustomerEmail);

            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Orders)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Customer configuration
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Company).HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.NormalizedEmail).HasMaxLength(200);
            entity.Property(e => e.NormalizedPhone).HasMaxLength(50);
            entity.Property(e => e.NormalizedName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.NormalizedCompany).HasMaxLength(200);
            entity.Property(e => e.Notes).HasMaxLength(8000);

            entity.HasMany(e => e.OwnedItems)
                .WithOne()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.NoteEntries)
                .WithOne()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.NormalizedEmail);
            entity.HasIndex(e => e.NormalizedPhone);
            entity.HasIndex(e => e.NormalizedName);
            entity.HasIndex(e => e.NormalizedCompany);
        });

        // CustomerOwnedItem configuration
        modelBuilder.Entity<CustomerOwnedItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(300);
            entity.Property(e => e.SerialNumber).HasMaxLength(100);
            entity.Property(e => e.Notes).HasMaxLength(2000);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // CustomerNote configuration
        modelBuilder.Entity<CustomerNote>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Text).IsRequired().HasMaxLength(4000);
            entity.Property(e => e.Author).HasMaxLength(200);
            entity.HasIndex(e => new { e.CustomerId, e.CreatedDate });
        });

        // OrderItem configuration
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ProductSku).IsRequired().HasMaxLength(50);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // AdminUser configuration
        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.TotpSecret).HasMaxLength(200);

            entity.HasIndex(e => e.Email).IsUnique();
        });

        // ContactMessage configuration
        modelBuilder.Entity<ContactMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(30);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(4000);

            entity.HasIndex(e => e.CreatedAt);
        });
    }
}
