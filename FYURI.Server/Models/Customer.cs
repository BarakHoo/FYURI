using System.Text.Json.Serialization;

namespace FYURI.Server.Models;

public class Customer
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Company { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }

    // Normalized lookup keys used to recognize a returning client on new orders.
    public string? NormalizedEmail { get; set; }
    public string? NormalizedPhone { get; set; }
    public required string NormalizedName { get; set; }
    public string? NormalizedCompany { get; set; }

    // Legacy free-form notes; superseded by the CustomerNote log.
    public string? Notes { get; set; }

    public List<CustomerOwnedItem> OwnedItems { get; set; } = new();
    public List<CustomerNote> NoteEntries { get; set; } = new();
    [JsonIgnore]
    public List<OrderRequest> Orders { get; set; } = new();

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? LastOrderDate { get; set; }

    public static string NormalizeText(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : string.Join(' ', value.Trim().ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));

    public static string? NormalizeEmail(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim().ToLowerInvariant();

    public static string? NormalizePhone(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var digits = new string(value.Where(char.IsDigit).ToArray());
        if (digits.Length == 0) return null;
        // Collapse Israeli international prefix so 972-54... and 054... match.
        if (digits.StartsWith("972") && digits.Length > 9) digits = "0" + digits[3..];
        return digits;
    }
}

// Equipment the client owns (purchased here or brought in for lab work).
public class CustomerOwnedItem
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int? ProductId { get; set; }
    public Product? Product { get; set; }
    public required string Description { get; set; }
    public string? SerialNumber { get; set; }
    public string? Notes { get; set; }
    public DateTime AddedDate { get; set; } = DateTime.UtcNow;
}

// Timestamped admin log entry (lab work, calls, arrangements, etc.).
public class CustomerNote
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public required string Text { get; set; }
    public string? Author { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}
