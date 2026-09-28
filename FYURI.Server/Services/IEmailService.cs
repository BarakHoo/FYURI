using FYURI.Server.Models;

namespace FYURI.Server.Services;

public interface IEmailService
{
    Task SendOrderNotificationToAdminAsync(OrderRequest order);
    Task SendOrderConfirmationToCustomerAsync(OrderRequest order);
    Task SendOrderStatusUpdateToCustomerAsync(OrderRequest order, OrderStatus previousStatus);
    Task SendContactMessageToAdminAsync(string name, string email, string? phone, string message);
    Task SendContactAutoReplyAsync(string name, string email);
}
