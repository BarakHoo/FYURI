using FYURI.Server.Controllers;
using FYURI.Server.Data;
using FYURI.Server.Models;
using FYURI.Server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FYURI.Server.Tests;

public sealed class OrdersControllerTests
{
    [Fact]
    public async Task CreateOrder_RejectsQuantityAboveRealStock()
    {
        await using var context = CreateContext();
        var product = AddProduct(context, stockQuantity: 2);
        var controller = CreateController(context);

        var result = await controller.CreateOrder(Request(
            new CreateOrderItemRequest { ProductId = product.Id, Quantity = 3 }));

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Only 2 unit(s)", badRequest.Value?.ToString());
        Assert.Empty(context.OrderRequests);
    }

    [Fact]
    public async Task CreateOrder_TreatsZeroStockAsUnavailable()
    {
        await using var context = CreateContext();
        var product = AddProduct(context, stockQuantity: 0, inStock: true);
        var controller = CreateController(context);

        var result = await controller.CreateOrder(Request(
            new CreateOrderItemRequest { ProductId = product.Id, Quantity = 1 }));

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("out of stock", badRequest.Value?.ToString());
        Assert.Empty(context.OrderRequests);
    }

    [Fact]
    public async Task CreateOrder_AggregatesDuplicateLinesBeforeCheckingStock()
    {
        await using var context = CreateContext();
        var product = AddProduct(context, stockQuantity: 3);
        var controller = CreateController(context);

        var result = await controller.CreateOrder(Request(
            new CreateOrderItemRequest { ProductId = product.Id, Quantity = 2 },
            new CreateOrderItemRequest { ProductId = product.Id, Quantity = 2 }));

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Only 3 unit(s)", badRequest.Value?.ToString());
        Assert.Empty(context.OrderRequests);
    }

    [Fact]
    public async Task CreateOrder_AggregatesValidDuplicateLinesIntoOneOrderItem()
    {
        await using var context = CreateContext();
        var product = AddProduct(context, stockQuantity: 4);
        var controller = CreateController(context);

        var result = await controller.CreateOrder(Request(
            new CreateOrderItemRequest { ProductId = product.Id, Quantity = 1 },
            new CreateOrderItemRequest { ProductId = product.Id, Quantity = 2 }));

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var order = Assert.IsType<OrderRequest>(ok.Value);
        var item = Assert.Single(order.Items);
        Assert.Equal(3, item.Quantity);
        Assert.Equal(product.Price * 3, order.TotalAmount);
    }

    [Fact]
    public async Task GetOrder_DisablesCachingForCustomerDetails()
    {
        await using var context = CreateContext();
        var controller = CreateController(context);

        var result = await controller.GetOrder("FYURI-MISSING");

        Assert.IsType<NotFoundResult>(result.Result);
        Assert.Equal("no-store", controller.Response.Headers.CacheControl);
        Assert.Equal("no-cache", controller.Response.Headers.Pragma);
    }

    private static OrdersController CreateController(AppDbContext context)
    {
        var controller = new OrdersController(
            context,
            new NoOpEmailService(),
            NullLogger<OrdersController>.Instance);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext(),
        };
        return controller;
    }

    private static CreateOrderRequest Request(params CreateOrderItemRequest[] items) =>
        new()
        {
            CustomerName = "Test Operator",
            CustomerEmail = "operator@example.com",
            CustomerPhone = "0501234567",
            Items = items.ToList(),
        };

    private static Product AddProduct(
        AppDbContext context,
        int stockQuantity,
        bool inStock = true)
    {
        var product = new Product
        {
            Name = "PVS-14 Test",
            NameHebrew = "PVS-14 בדיקה",
            Sku = $"TEST-{Guid.NewGuid():N}",
            Price = 3200m,
            Category = new Category
            {
                Name = "Night Vision",
                NameHebrew = "ראיית לילה",
                IsActive = true,
            },
            InStock = inStock,
            StockQuantity = stockQuantity,
            IsActive = true,
            ProductType = "monocular",
        };
        context.Products.Add(product);
        context.SaveChanges();
        return product;
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"orders-controller-{Guid.NewGuid()}")
            .Options;
        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    private sealed class NoOpEmailService : IEmailService
    {
        public Task SendOrderNotificationToAdminAsync(OrderRequest order) =>
            Task.CompletedTask;

        public Task SendOrderConfirmationToCustomerAsync(OrderRequest order) =>
            Task.CompletedTask;

        public Task SendContactMessageToAdminAsync(
            string name,
            string email,
            string? phone,
            string message) =>
            Task.CompletedTask;
    }
}
