using FYURI.Server.Models;
using System.Text;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace FYURI.Server.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _environment;

    public EmailService(
        ILogger<EmailService> logger,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        _logger = logger;
        _configuration = configuration;
        _environment = environment;
    }

    public async Task SendOrderNotificationToAdminAsync(OrderRequest order)
    {
        try
        {
            var adminEmail = _configuration["EmailSettings:AdminEmail"] ?? "admin@fyuri.co.il";
            var subject = $"הזמנה חדשה - {order.OrderNumber}";
            var htmlBody = BuildAdminEmailHtml(order);

            await SendEmailAsync(adminEmail, subject, htmlBody);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send admin notification email");
        }
    }

    public async Task SendOrderConfirmationToCustomerAsync(OrderRequest order)
    {
        try
        {
            var subject = $"קיבלנו את בקשתך - {order.OrderNumber}";
            var htmlBody = BuildCustomerEmailHtml(order);

            await SendEmailAsync(order.CustomerEmail, subject, htmlBody);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send customer confirmation email");
        }
    }

    public async Task SendContactMessageToAdminAsync(string name, string email, string? phone, string message)
    {
        var adminEmail = _configuration["EmailSettings:AdminEmail"] ?? "admin@fyuri.co.il";
        var subject = "פנייה חדשה מטופס יצירת קשר";

        // HTML-encode all user-supplied values to prevent HTML injection in the email
        var safeName = System.Net.WebUtility.HtmlEncode(name);
        var safeEmail = System.Net.WebUtility.HtmlEncode(email);
        var safePhone = System.Net.WebUtility.HtmlEncode(phone ?? "");
        var safeMessage = System.Net.WebUtility.HtmlEncode(message).Replace("\n", "<br/>");

        var htmlBody = $@"
            <div dir=""rtl"" style=""font-family:Arial,sans-serif;"">
                <h2>פנייה חדשה מהאתר</h2>
                <p><strong>שם:</strong> {safeName}</p>
                <p><strong>אימייל:</strong> {safeEmail}</p>
                <p><strong>טלפון:</strong> {safePhone}</p>
                <p><strong>הודעה:</strong></p>
                <p>{safeMessage}</p>
            </div>";

        await SendEmailAsync(adminEmail, subject, htmlBody);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var smtpServer = _configuration["EmailSettings:SmtpServer"];
        var smtpUsername = _configuration["EmailSettings:SmtpUsername"];
        var smtpPassword = _configuration["EmailSettings:SmtpPassword"];
        var senderEmail = _configuration["EmailSettings:SenderEmail"] ?? smtpUsername ?? "no-reply@fyuri.co.il";
        var senderName = _configuration["EmailSettings:SenderName"] ?? "FYURI";
        var smtpPort = int.TryParse(_configuration["EmailSettings:SmtpPort"], out var port) ? port : 587;

        if (string.IsNullOrWhiteSpace(smtpServer))
        {
            // Full email bodies contain customer contact/order data. They are
            // useful during local development but must never be copied into
            // production container logs.
            if (_environment.IsDevelopment())
            {
                _logger.LogInformation("=== EMAIL (SMTP NOT CONFIGURED) ===");
                _logger.LogInformation("To: {ToEmail}", toEmail);
                _logger.LogInformation("Subject: {Subject}", subject);
                _logger.LogInformation("Body:\n{Body}", htmlBody);
                _logger.LogInformation("====================================");
            }
            else
            {
                _logger.LogWarning(
                    "SMTP is not configured; an email with subject {Subject} was not sent.",
                    subject);
            }
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, senderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpServer, smtpPort, SecureSocketOptions.StartTls);

        if (!string.IsNullOrWhiteSpace(smtpUsername))
        {
            await client.AuthenticateAsync(smtpUsername, smtpPassword ?? string.Empty);
        }

        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("Email sent to {ToEmail} with subject {Subject}", toEmail, subject);
    }

    private static string BuildItemsRowsHtml(OrderRequest order)
    {
        var sb = new StringBuilder();
        foreach (var item in order.Items)
        {
            sb.Append($@"
                <tr>
                    <td style=""padding:8px;border-bottom:1px solid #eee;"">{item.ProductName} ({item.ProductSku})</td>
                    <td style=""padding:8px;border-bottom:1px solid #eee;text-align:center;"">{item.Quantity}</td>
                    <td style=""padding:8px;border-bottom:1px solid #eee;text-align:right;"">₪{item.UnitPrice:N2}</td>
                    <td style=""padding:8px;border-bottom:1px solid #eee;text-align:right;"">₪{item.TotalPrice:N2}</td>
                </tr>");
        }
        return sb.ToString();
    }

    private string BuildAdminEmailHtml(OrderRequest order)
    {
        var itemsRows = BuildItemsRowsHtml(order);

        return $@"
<div dir=""rtl"" style=""font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;"">
    <h2 style=""color:#1976d2;"">הזמנה חדשה התקבלה במערכת FYURI</h2>
    <p>מספר הזמנה: <strong>{order.OrderNumber}</strong></p>
    <p>תאריך: {order.CreatedDate:dd/MM/yyyy HH:mm}</p>

    <h3 style=""color:#1976d2;"">פרטי לקוח</h3>
    <p>
        שם: {order.CustomerName}<br/>
        טלפון: {order.CustomerPhone}<br/>
        אימייל: {order.CustomerEmail}<br/>
        {(!string.IsNullOrEmpty(order.CustomerAddress) ? $"כתובת: {order.CustomerAddress}<br/>" : "")}
        {(!string.IsNullOrEmpty(order.CustomerCity) ? $"עיר: {order.CustomerCity}<br/>" : "")}
    </p>
    {(!string.IsNullOrEmpty(order.CustomerNotes) ? $"<p><strong>הערות לקוח:</strong> {order.CustomerNotes}</p>" : "")}

    <h3 style=""color:#1976d2;"">פריטים בהזמנה</h3>
    <table style=""width:100%;border-collapse:collapse;"">
        <thead>
            <tr style=""background:#f5f5f5;"">
                <th style=""padding:8px;text-align:right;"">מוצר</th>
                <th style=""padding:8px;text-align:center;"">כמות</th>
                <th style=""padding:8px;text-align:right;"">מחיר יחידה</th>
                <th style=""padding:8px;text-align:right;"">סה""כ</th>
            </tr>
        </thead>
        <tbody>{itemsRows}</tbody>
    </table>
    <p style=""text-align:left;font-size:18px;margin-top:12px;""><strong>סה""כ כולל: ₪{order.TotalAmount:N2}</strong></p>

    <p style=""margin-top:24px;"">אנא צור קשר עם הלקוח לאישור ההזמנה ותיאום אספקה.</p>
</div>";
    }

    private string BuildCustomerEmailHtml(OrderRequest order)
    {
        var itemsRows = BuildItemsRowsHtml(order);

        return $@"
<div dir=""rtl"" style=""font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;"">
    <div style=""text-align:center;margin-bottom:24px;"">
        <div style=""font-size:48px;color:#2e7d32;"">&#10004;</div>
        <h2 style=""margin:8px 0;"">ההזמנה נשלחה בהצלחה!</h2>
        <p style=""color:#666;"">מספר הזמנה: {order.OrderNumber}</p>
    </div>

    <div style=""background:#edf7ed;border:1px solid #c8e6c9;border-radius:4px;padding:16px;margin-bottom:16px;"">
        <p style=""margin:0;font-weight:600;"">תודה רבה, {order.CustomerName}!</p>
        <p style=""margin:8px 0 0;"">נציג שלנו יצור אתך קשר בהקדם האפשרי במהלך שעות הפעילות שלנו. נשמח לענות על כל שאלה!</p>
    </div>

    <div style=""background:#fafafa;border-radius:4px;padding:16px;margin-bottom:16px;"">
        <h3 style=""color:#1976d2;margin-top:0;"">שעות הפעילות שלנו</h3>
        <p style=""margin:4px 0;color:#666;"">ראשון - חמישי: 9:00 - 17:00</p>
        <p style=""margin:4px 0;color:#666;"">שישי: 9:00 - 13:00</p>
        <p style=""margin:4px 0;color:#666;"">שבת: סגור</p>
        <p style=""margin:8px 0 0;color:#1976d2;"">טלפון: 054-477-0200</p>
    </div>

    <h3 style=""color:#1976d2;"">סיכום ההזמנה</h3>
    <table style=""width:100%;border-collapse:collapse;"">
        <thead>
            <tr style=""background:#f5f5f5;"">
                <th style=""padding:8px;text-align:right;"">מוצר</th>
                <th style=""padding:8px;text-align:center;"">כמות</th>
                <th style=""padding:8px;text-align:right;"">מחיר יחידה</th>
                <th style=""padding:8px;text-align:right;"">סה""כ</th>
            </tr>
        </thead>
        <tbody>{itemsRows}</tbody>
    </table>
    <p style=""text-align:left;font-size:18px;margin-top:12px;""><strong>סה""כ: ₪{order.TotalAmount:N2}</strong></p>

    <div style=""background:#e3f2fd;border-radius:4px;padding:16px;margin-top:16px;"">
        <p style=""margin:0 0 8px;font-weight:600;"">מה הלאה?</p>
        <p style=""margin:4px 0;"">1. תקבל אישור בכתובת האימייל שהזנת</p>
        <p style=""margin:4px 0;"">2. נציג שירות מטעמנו יצור אתך קשר בקרוב (בדרך כלל תוך 24 שעות)</p>
        <p style=""margin:4px 0;"">3. נאמת את ההזמנה ונתאם מועד אספקה</p>
        <p style=""margin:4px 0;"">4. נשמח לענות על כל שאלה ולעזור לך לבחור את הציוד המושלם</p>
    </div>

    <p style=""margin-top:24px;"">אם יש לך שאלות, תוכל ליצור קשר:</p>
    <p>
        טלפון: 054-477-0200<br/>
        אימייל: info@fyuri.co.il
    </p>

    <p style=""margin-top:24px;"">בברכה,<br/>צוות FYURI<br/>www.fyuri.co.il</p>
</div>";
    }
}
