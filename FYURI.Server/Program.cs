using FYURI.Server.Services;
using FYURI.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serializer to use string values for enums
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add MySQL Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured");
}
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(connectionString));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("https://localhost:5173", "http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Register services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddSingleton<ITotpService, TotpService>();
builder.Services.AddSingleton<IJwtService, JwtService>();

// JWT Authentication for the admin panel, token read from an httpOnly cookie
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret is not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "FYURI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "FYURI";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.FromSeconds(30)
    };

    // Admin session token is stored in an httpOnly cookie, not sent as a bearer header
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.TryGetValue("fyuri_admin_session", out var cookieToken))
            {
                context.Token = cookieToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireAuthenticatedUser().RequireClaim(System.Security.Claims.ClaimTypes.Role, "Admin"));
});

// Rate limiting — protects write-heavy public endpoints from abuse
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    static RateLimitPartition<string> PerIp(HttpContext ctx, int permitLimit, TimeSpan window) =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = window,
                QueueLimit = 0,
            });

    // Order creation: 10 per 5 minutes per IP
    options.AddPolicy("orders", ctx => PerIp(ctx, 10, TimeSpan.FromMinutes(5)));
    // Custom-build creation: 30 per 5 minutes per IP (each creates a DB row)
    options.AddPolicy("builder", ctx => PerIp(ctx, 30, TimeSpan.FromMinutes(5)));
    // Cart mutations: 120 per minute per IP
    options.AddPolicy("cart", ctx => PerIp(ctx, 120, TimeSpan.FromMinutes(1)));
    // Contact form: 5 per 10 minutes per IP
    options.AddPolicy("contact", ctx => PerIp(ctx, 5, TimeSpan.FromMinutes(10)));
    // Admin auth (login / 2FA): 10 per 5 minutes per IP
    options.AddPolicy("auth", ctx => PerIp(ctx, 10, TimeSpan.FromMinutes(5)));
});

// Trust X-Forwarded-For / X-Forwarded-Proto from the nginx reverse proxy so
// per-IP rate limiting sees the real client address, not the proxy's.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

// Initialize database (retry to handle MySQL container still starting up)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    const int maxRetries = 10;
    for (var attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            var context = services.GetRequiredService<AppDbContext>();
            DbInitializer.Initialize(context, builder.Configuration);

            // Clean up orphaned hidden custom-build products (older than 7 days,
            // not referenced by any cart item or order item)
            var cutoff = DateTime.UtcNow.AddDays(-7);
            var orphans = context.Products
                .Where(p => p.ProductType == "custom-build"
                    && !p.IsActive
                    && p.CreatedDate < cutoff
                    && !context.CartItems.Any(c => c.ProductId == p.Id)
                    && !context.OrderItems.Any(o => o.ProductId == p.Id))
                .ToList();
            if (orphans.Count > 0)
            {
                context.Products.RemoveRange(orphans);
                context.SaveChanges();
                logger.LogInformation("Removed {Count} orphaned custom-build products.", orphans.Count);
            }
            break;
        }
        catch (Exception ex)
        {
            if (attempt == maxRetries)
            {
                logger.LogError(ex, "An error occurred while seeding the database after {Attempts} attempts.", attempt);
                break;
            }

            logger.LogWarning("Database not ready yet (attempt {Attempt}/{MaxRetries}): {Message}", attempt, maxRetries, ex.Message);
            Thread.Sleep(3000);
        }
    }
}

// Serve static files from wwwroot (for images)
app.UseForwardedHeaders();

app.UseStaticFiles();

app.UseDefaultFiles();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
