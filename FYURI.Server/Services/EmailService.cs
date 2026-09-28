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

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task SendOrderNotificationToAdminAsync(OrderRequest order)
    {
        try
        {
            var adminEmail = _configuration["EmailSettings:AdminEmail"] ?? "admin@fyuri.co.il";
            var subject = $"הזמנה חדשה - {order.OrderNumber}";
            var htmlBody = BuildAdminEmailHtml(order);

            await SendEmailAsync(adminEmail, subject, htmlBody, replyTo: order.CustomerEmail);
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

    public async Task SendOrderStatusUpdateToCustomerAsync(OrderRequest order, OrderStatus previousStatus)
    {
        try
        {
            var (subject, headline, body) = GetStatusCopy(order);
            var htmlBody = BuildStatusEmailHtml(order, headline, body);

            await SendEmailAsync(order.CustomerEmail, $"{subject} - {order.OrderNumber}", htmlBody);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send status update email for order {OrderNumber} ({Previous} -> {Current})",
                order.OrderNumber, previousStatus, order.Status);
        }
    }

    public async Task SendContactMessageToAdminAsync(string name, string email, string? phone, string message)
    {
        var adminEmail = _configuration["EmailSettings:AdminEmail"] ?? "admin@fyuri.co.il";
        var subject = $"פנייה חדשה מטופס יצירת קשר - {name}";

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
                <p style=""color:#666;font-size:12px;margin-top:16px;"">לחץ על ""השב"" כדי לענות ישירות ללקוח.</p>
            </div>";

        await SendEmailAsync(adminEmail, subject, htmlBody, replyTo: email);
    }

    public async Task SendContactAutoReplyAsync(string name, string email)
    {
        try
        {
            var subject = "קיבלנו את פנייתך - FYURI";
            var htmlBody = $@"
<div dir=""rtl"" style=""font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;"">
    <h2 style=""color:#1976d2;"">תודה שפנית אלינו, {H(name)}!</h2>
    <p>קיבלנו את ההודעה שלך ונחזור אליך בהקדם האפשרי (בדרך כלל תוך יום עסקים אחד).</p>
    <p>במקרה דחוף ניתן ליצור קשר בטלפון או בוואטסאפ: <strong>054-477-0200</strong></p>
    <p style=""margin-top:24px;"">בברכה,<br/>צוות FYURI<br/>www.fyuri.co.il</p>
</div>";

            await SendEmailAsync(email, subject, htmlBody);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send contact auto-reply to {Email}", email);
        }
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody, string? replyTo = null)
    {
        var smtpServer = _configuration["EmailSettings:SmtpServer"];
        var smtpUsername = _configuration["EmailSettings:SmtpUsername"];
        var smtpPassword = _configuration["EmailSettings:SmtpPassword"];
        var senderEmail = _configuration["EmailSettings:SenderEmail"] ?? smtpUsername ?? "no-reply@fyuri.co.il";
        var senderName = _configuration["EmailSettings:SenderName"] ?? "FYURI";
        var smtpPort = int.TryParse(_configuration["EmailSettings:SmtpPort"], out var port) ? port : 587;
        // "StartTls" (587, default), "SslOnConnect" (465), "None" (local dev catchers like Mailpit), "Auto"
        var sslMode = Enum.TryParse<SecureSocketOptions>(_configuration["EmailSettings:SslMode"], true, out var parsed)
            ? parsed
            : SecureSocketOptions.StartTls;

        if (string.IsNullOrWhiteSpace(smtpServer))
        {
            // No SMTP configured - fall back to logging so nothing crashes in dev environments
            _logger.LogInformation("=== EMAIL (SMTP NOT CONFIGURED) ===");
            _logger.LogInformation("To: {ToEmail}", toEmail);
            _logger.LogInformation("Subject: {Subject}", subject);
            _logger.LogInformation("Body:\n{Body}", htmlBody);
            _logger.LogInformation("====================================");
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, senderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        if (!string.IsNullOrWhiteSpace(replyTo) && MailboxAddress.TryParse(replyTo, out var replyAddress))
        {
            message.ReplyTo.Add(replyAddress);
        }
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpServer, smtpPort, sslMode);

        if (!string.IsNullOrWhiteSpace(smtpUsername))
        {
            await client.AuthenticateAsync(smtpUsername, smtpPassword);
        }

        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("Email sent to {ToEmail} with subject {Subject}", toEmail, subject);
    }

    // HTML-encode any user- or DB-supplied value before interpolating it into an email body
    private static string H(string? value) => System.Net.WebUtility.HtmlEncode(value ?? string.Empty);

    private static string BuildItemsRowsHtml(OrderRequest order)
    {
        var sb = new StringBuilder();
        foreach (var item in order.Items)
        {
            sb.Append($@"
                <tr>
                    <td style=""padding:8px;border-bottom:1px solid #eee;"">{H(item.ProductName)} ({H(item.ProductSku)})</td>
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
    <p>מספר הזמנה: <strong>{H(order.OrderNumber)}</strong></p>
    <p>תאריך: {order.CreatedDate:dd/MM/yyyy HH:mm}</p>

    <h3 style=""color:#1976d2;"">פרטי לקוח</h3>
    <p>
        שם: {H(order.CustomerName)}<br/>
        טלפון: {H(order.CustomerPhone)}<br/>
        אימייל: {H(order.CustomerEmail)}<br/>
        {(!string.IsNullOrEmpty(order.CustomerAddress) ? $"כתובת: {H(order.CustomerAddress)}<br/>" : "")}
        {(!string.IsNullOrEmpty(order.CustomerCity) ? $"עיר: {H(order.CustomerCity)}<br/>" : "")}
    </p>
    {(!string.IsNullOrEmpty(order.CustomerNotes) ? $"<p><strong>הערות לקוח:</strong> {H(order.CustomerNotes).Replace("\n", "<br/>")}</p>" : "")}

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
        <p style=""color:#666;"">מספר הזמנה: {H(order.OrderNumber)}</p>
    </div>

    <div style=""background:#edf7ed;border:1px solid #c8e6c9;border-radius:4px;padding:16px;margin-bottom:16px;"">
        <p style=""margin:0;font-weight:600;"">תודה רבה, {H(order.CustomerName)}!</p>
        <p style=""margin:8px 0 0;"">נציג שלנו יצור אתך קשר בהקדם האפשרי. נשמח לענות על כל שאלה!</p>
    </div>

    <div style=""background:#fafafa;border-radius:4px;padding:16px;margin-bottom:16px;"">
        <h3 style=""color:#1976d2;margin-top:0;"">דברו איתנו</h3>
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

    private static (string Subject, string Headline, string Body) GetStatusCopy(OrderRequest order) => order.Status switch
    {
        OrderStatus.Contacted => ("יצרנו איתך קשר", "ההזמנה שלך בטיפול",
            "נציג מטעמנו יצר איתך קשר בנוגע להזמנה. אם פספסת את השיחה, נשמח שתחזור אלינו בטלפון או בוואטסאפ."),
        OrderStatus.Approved => ("ההזמנה אושרה", "ההזמנה שלך אושרה!",
            "אישרנו את ההזמנה ואנו מתחילים בהכנתה. נעדכן אותך כשההזמנה מוכנה למסירה."),
        OrderStatus.Completed => ("ההזמנה הושלמה", "ההזמנה שלך הושלמה",
            "תודה שקנית ב-FYURI! מקווים שתיהנה מהציוד. לכל שאלה, תמיכה או שירות מעבדה - אנחנו כאן."),
        OrderStatus.Rejected => ("עדכון לגבי ההזמנה", "לא ניתן לאשר את ההזמנה",
            "לצערנו לא נוכל לספק את ההזמנה במתכונתה הנוכחית. נשמח לעזור לך למצוא חלופה מתאימה - צור איתנו קשר."),
        OrderStatus.Cancelled => ("ההזמנה בוטלה", "ההזמנה שלך בוטלה",
            "ההזמנה בוטלה. אם מדובר בטעות או שתרצה לחדש אותה, נשמח לשמוע ממך."),
        _ => ("עדכון לגבי ההזמנה", "ההזמנה שלך עודכנה", "סטטוס ההזמנה שלך עודכן."),
    };

    private static string BuildStatusEmailHtml(OrderRequest order, string headline, string body)
    {
        var isNegative = order.Status is OrderStatus.Rejected or OrderStatus.Cancelled;
        var accent = isNegative ? "#b26a00" : "#2e7d32";
        var panelBg = isNegative ? "#fff8e1" : "#edf7ed";
        var panelBorder = isNegative ? "#ffe082" : "#c8e6c9";

        return $@"
<div dir=""rtl"" style=""font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;"">
    <h2 style=""color:{accent};margin-bottom:4px;"">{headline}</h2>
    <p style=""color:#666;margin-top:0;"">מספר הזמנה: <strong>{H(order.OrderNumber)}</strong></p>

    <div style=""background:{panelBg};border:1px solid {panelBorder};border-radius:4px;padding:16px;margin:16px 0;"">
        <p style=""margin:0;"">שלום {H(order.CustomerName)},</p>
        <p style=""margin:8px 0 0;"">{body}</p>
    </div>

    <p style=""font-size:15px;""><strong>סה""כ ההזמנה:</strong> ₪{order.TotalAmount:N2}</p>

    <div style=""background:#fafafa;border-radius:4px;padding:16px;margin-top:16px;"">
        <p style=""margin:0;font-weight:600;color:#1976d2;"">דברו איתנו</p>
        <p style=""margin:8px 0 0;"">טלפון / וואטסאפ: 054-477-0200</p>
    </div>

    <p style=""margin-top:24px;"">בברכה,<br/>צוות FYURI<br/>www.fyuri.co.il</p>
</div>";
    }
}
