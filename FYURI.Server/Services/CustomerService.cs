using Microsoft.EntityFrameworkCore;
using FYURI.Server.Data;
using FYURI.Server.Models;

namespace FYURI.Server.Services;

public interface ICustomerService
{
    /// <summary>
    /// Finds the client that matches the supplied contact details (by email, phone,
    /// company, or full name — in that order of confidence) or creates a new one.
    /// Contact fields on the matched client are filled in when they were previously empty.
    /// Does not call SaveChanges.
    /// </summary>
    Task<Customer> ResolveAsync(string name, string? company, string? email, string? phone, string? address, string? city);
}

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _context;

    public CustomerService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Customer> ResolveAsync(string name, string? company, string? email, string? phone, string? address, string? city)
    {
        var normEmail = Customer.NormalizeEmail(email);
        var normPhone = Customer.NormalizePhone(phone);
        var normName = Customer.NormalizeText(name);
        var normCompany = Customer.NormalizeText(company);

        Customer? match = null;

        if (normEmail != null)
            match = await _context.Customers.FirstOrDefaultAsync(c => c.NormalizedEmail == normEmail);

        if (match == null && normPhone != null)
            match = await _context.Customers.FirstOrDefaultAsync(c => c.NormalizedPhone == normPhone);

        if (match == null && normCompany.Length > 0)
            match = await _context.Customers.FirstOrDefaultAsync(c => c.NormalizedCompany == normCompany);

        if (match == null && normName.Length > 0)
            match = await _context.Customers.FirstOrDefaultAsync(c => c.NormalizedName == normName);

        if (match == null)
        {
            match = new Customer
            {
                Name = name.Trim(),
                Company = string.IsNullOrWhiteSpace(company) ? null : company.Trim(),
                Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim(),
                Phone = string.IsNullOrWhiteSpace(phone) ? null : phone.Trim(),
                Address = string.IsNullOrWhiteSpace(address) ? null : address.Trim(),
                City = string.IsNullOrWhiteSpace(city) ? null : city.Trim(),
                NormalizedEmail = normEmail,
                NormalizedPhone = normPhone,
                NormalizedName = normName,
                NormalizedCompany = normCompany.Length > 0 ? normCompany : null,
            };
            _context.Customers.Add(match);
            return match;
        }

        // Enrich the existing record with any details we didn't have yet.
        if (match.Email == null && !string.IsNullOrWhiteSpace(email)) { match.Email = email.Trim(); match.NormalizedEmail = normEmail; }
        if (match.Phone == null && !string.IsNullOrWhiteSpace(phone)) { match.Phone = phone.Trim(); match.NormalizedPhone = normPhone; }
        if (match.Company == null && !string.IsNullOrWhiteSpace(company)) { match.Company = company.Trim(); match.NormalizedCompany = normCompany; }
        if (match.Address == null && !string.IsNullOrWhiteSpace(address)) match.Address = address.Trim();
        if (match.City == null && !string.IsNullOrWhiteSpace(city)) match.City = city.Trim();

        return match;
    }
}
