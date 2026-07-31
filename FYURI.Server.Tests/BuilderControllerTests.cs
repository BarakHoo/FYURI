using FYURI.Server.Controllers;
using FYURI.Server.Data;
using FYURI.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FYURI.Server.Tests;

public sealed class BuilderControllerTests
{
    [Fact]
    public async Task BiocularPreset_UsesOneTubeAndObjectiveButTwoEyepieces()
    {
        await using var context = CreateContext();
        var controller = new BuilderController(
            context,
            NullLogger<BuilderController>.Instance);

        var result = await controller.CreateCustomBuild(new CustomBuildRequest
        {
            DeviceType = "biocular",
            Parts =
            [
                Part("housing", "housing-pvs7"),
                Part("tube", "tube-elbit-green"),
                Part("objective", "obj-1x"),
                Part("eyepiece", "eye-standard"),
                Part("battery", "bat-onboard"),
                Part("mount", "mount-pvs7-bayonet"),
                Part("illuminator", "ir-none"),
            ],
        });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var product = Assert.IsType<Product>(ok.Value);

        Assert.Equal(18190m, product.Price);
        Assert.Equal("Bi-ocular", product.Specifications["Device Type"]);
        Assert.Equal(
            "Standard Eyepiece",
            product.Specifications["Eyepiece Lens (x2)"]);
        Assert.DoesNotContain("Image Intensifier Tube (x2)", product.Specifications.Keys);
    }

    [Fact]
    public async Task MissingRequiredHousing_IsRejected()
    {
        await using var context = CreateContext();
        var controller = new BuilderController(
            context,
            NullLogger<BuilderController>.Instance);

        var result = await controller.CreateCustomBuild(new CustomBuildRequest
        {
            DeviceType = "monocular",
            Parts = [Part("tube", "tube-photonis-echo")],
        });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Housing / Chassis", badRequest.Value?.ToString());
        Assert.Empty(context.Products);
    }

    [Fact]
    public async Task DeviceIncompatibleHousing_IsRejected()
    {
        await using var context = CreateContext();
        var controller = new BuilderController(
            context,
            NullLogger<BuilderController>.Instance);

        var result = await controller.CreateCustomBuild(new CustomBuildRequest
        {
            DeviceType = "biocular",
            Parts = [Part("housing", "housing-pvs14")],
        });

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Invalid option", badRequest.Value?.ToString());
        Assert.Empty(context.Products);
    }

    private static CustomBuildPart Part(string categoryId, string optionId) =>
        new()
        {
            CategoryId = categoryId,
            OptionId = optionId,
        };

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"builder-controller-{Guid.NewGuid()}")
            .Options;
        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        context.Categories.Add(new Category
        {
            Name = "Night Vision",
            NameHebrew = "ראיית לילה",
            DisplayOrder = 1,
            IsActive = true,
        });
        context.SaveChanges();
        return context;
    }
}
