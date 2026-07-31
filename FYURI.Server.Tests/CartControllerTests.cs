using FYURI.Server.Controllers;
using FYURI.Server.Data;
using FYURI.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FYURI.Server.Tests;

public sealed class CartControllerTests
{
    [Fact]
    public async Task AddToCart_RejectsQuantityAboveRealStock()
    {
        await using var context = CreateContext();
        var product = AddProduct(context, stockQuantity: 2);
        var controller = CreateController(context);

        var result = await controller.AddToCart("stock-test", new AddToCartRequest
        {
            ProductId = product.Id,
            Quantity = 3,
        });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Only 2 unit(s)", badRequest.Value?.ToString());
        Assert.Empty(context.CartItems);
    }

    [Fact]
    public async Task AddToCart_UsesExistingQuantityWhenEnforcingStock()
    {
        await using var context = CreateContext();
        var product = AddProduct(context, stockQuantity: 3);
        var existing = new CartItem
        {
            SessionId = "stock-test",
            ProductId = product.Id,
            Quantity = 2,
            PriceAtAddTime = product.Price,
        };
        context.CartItems.Add(existing);
        await context.SaveChangesAsync();
        var controller = CreateController(context);

        var result = await controller.AddToCart("stock-test", new AddToCartRequest
        {
            ProductId = product.Id,
            Quantity = 2,
        });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Only 3 unit(s)", badRequest.Value?.ToString());
        Assert.Equal(2, existing.Quantity);
    }

    [Fact]
    public async Task UpdateCartItem_TreatsZeroStockAsUnavailable()
    {
        await using var context = CreateContext();
        var product = AddProduct(context, stockQuantity: 0, inStock: true);
        var item = new CartItem
        {
            SessionId = "stock-test",
            ProductId = product.Id,
            Quantity = 1,
            PriceAtAddTime = product.Price,
        };
        context.CartItems.Add(item);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var controller = CreateController(context);

        var result = await controller.UpdateCartItem(
            "stock-test",
            item.Id,
            new UpdateCartItemRequest { Quantity = 1 });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Product is out of stock", badRequest.Value);
    }

    [Fact]
    public async Task UpdateCartItem_RejectsQuantityAboveRealStock()
    {
        await using var context = CreateContext();
        var product = AddProduct(context, stockQuantity: 2);
        var item = new CartItem
        {
            SessionId = "stock-test",
            ProductId = product.Id,
            Quantity = 1,
            PriceAtAddTime = product.Price,
        };
        context.CartItems.Add(item);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        var controller = CreateController(context);

        var result = await controller.UpdateCartItem(
            "stock-test",
            item.Id,
            new UpdateCartItemRequest { Quantity = 3 });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Only 2 unit(s)", badRequest.Value?.ToString());
    }

    private static CartController CreateController(AppDbContext context) =>
        new(context, NullLogger<CartController>.Instance);

    private static Product AddProduct(
        AppDbContext context,
        int stockQuantity,
        bool inStock = true)
    {
        var category = new Category
        {
            Name = "Night Vision",
            NameHebrew = "ראיית לילה",
            IsActive = true,
        };
        var product = new Product
        {
            Name = "PVS-14 Test",
            NameHebrew = "PVS-14 בדיקה",
            Sku = $"TEST-{Guid.NewGuid():N}",
            Price = 3200m,
            Category = category,
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
            .UseInMemoryDatabase($"cart-controller-{Guid.NewGuid()}")
            .Options;
        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}
