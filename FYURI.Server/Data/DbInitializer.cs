using FYURI.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FYURI.Server.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context, IConfiguration configuration)
    {
        // Create database and apply any pending migrations
        context.Database.Migrate();

        SeedAdminUser(context, configuration);

        // Check if data already exists
        if (context.Categories.Any())
        {
            SeedThermalCategoryAndProducts(context); // idempotent — safe on every startup
            SeedBuilderComponentProducts(context); // idempotent — safe on every startup
            AssignRealProductPhotos(context); // idempotent — safe on every startup
            BackfillMissingProductImages(context); // idempotent — safe on every startup
            return; // Database has been seeded
        }

        // Seed Categories
        var categories = new Category[]
        {
            new Category
            {
                Name = "Night Vision",
                NameHebrew = "אמצעי ראיית לילה",
                Description = "Night vision devices and systems",
                DescriptionHebrew = "מכשירי ומערכות ראיית לילה",
                DisplayOrder = 1,
                IsActive = true
            },
            new Category
            {
                Name = "Image Intensifier Tubes",
                NameHebrew = "מגברי אור",
                Description = "High-quality image intensifier tubes",
                DescriptionHebrew = "מגברי אור איכותיים",
                DisplayOrder = 2,
                IsActive = true
            },
            new Category
            {
                Name = "Optics",
                NameHebrew = "אופטיקה",
                Description = "Optical lenses and systems",
                DescriptionHebrew = "עדשות ומערכות אופטיות",
                DisplayOrder = 3,
                IsActive = true
            },
            new Category
            {
                Name = "Accessories",
                NameHebrew = "אביזרים",
                Description = "Accessories and mounting systems",
                DescriptionHebrew = "אביזרים ומערכות התקנה",
                DisplayOrder = 4,
                IsActive = true
            },
            new Category
            {
                Name = "Spare Parts",
                NameHebrew = "חלפים",
                Description = "Replacement parts and components",
                DescriptionHebrew = "חלקי חילוף ורכיבים",
                DisplayOrder = 5,
                IsActive = true
            }
        };

        context.Categories.AddRange(categories);
        context.SaveChanges();

        // Get the Night Vision category ID
        var nightVisionCategory = categories[0];

        // Seed Products
        var products = new Product[]
        {
            new Product
            {
                Name = "BNVD-1431",
                NameHebrew = "BNVD-1431",
                Sku = "BNVD-1431",
                Description = "Dual-tube night vision device with superior performance. Features advanced image intensifier tubes for exceptional clarity in low-light conditions.",
                DescriptionHebrew = "מכשיר ראיית לילה דו עיני עם ביצועים מעולים. כולל מגברי אור מתקדמים לבהירות יוצאת דופן בתנאי תאורה נמוכים.",
                Price = 8500.00M,
                CategoryId = 1,
                ProductType = "binocular",
                InStock = true,
                StockQuantity = 5,
                Generation = "Gen 3",
                Resolution = "64-72 lp/mm",
                Fom = "1800+",
                TubeType = "White Phosphor",
                ThumbnailUrl = "/images/products/pvs-31.jpg",
                ImageUrls = new List<string> { "/images/products/pvs-31.jpg" },
                Specifications = new Dictionary<string, string>
                {
                    { "Weight", "680g" },
                    { "Field of View", "40°" },
                    { "Magnification", "1x" },
                    { "Battery Life", "20+ hours" },
                    { "Waterproof", "Yes (IP67)" }
                },
                IsActive = true
            },
            new Product
            {
                Name = "PVS-14",
                NameHebrew = "PVS-14",
                Sku = "PVS-14",
                Description = "Single-tube monocular night vision device. Lightweight, versatile, and combat-proven design suitable for various applications.",
                DescriptionHebrew = "מכשיר ראיית לילה חד עיני. עיצוב קל משקל, רב-תכליתי ומוכח בקרב המתאים ליישומים שונים.",
                Price = 3200.00M,
                CategoryId = 1,
                ProductType = "monocular",
                InStock = true,
                StockQuantity = 12,
                Generation = "Gen 3",
                Resolution = "64 lp/mm",
                Fom = "1600+",
                TubeType = "Green Phosphor",
                ThumbnailUrl = "/images/products/pvs-31.jpg",
                ImageUrls = new List<string> { "/images/products/pvs-31.jpg" },
                Specifications = new Dictionary<string, string>
                {
                    { "Weight", "340g" },
                    { "Field of View", "40°" },
                    { "Magnification", "1x" },
                    { "Battery Life", "50+ hours" },
                    { "Waterproof", "Yes (IP67)" }
                },
                IsActive = true
            },
            new Product
            {
                Name = "BNVD - Barak",
                NameHebrew = "BNVD - ברק",
                Sku = "BNVD-BARAK",
                Description = "Israeli-made dual-tube night vision system. Premium quality with advanced features for professional and military use.",
                DescriptionHebrew = "מערכת ראיית לילה דו עינית ישראלית. איכות פרימיום עם תכונות מתקדמות לשימוש מקצועי וצבאי.",
                Price = 9500.00M,
                CategoryId = 1,
                ProductType = "binocular",
                InStock = true,
                StockQuantity = 3,
                Generation = "Gen 3",
                Resolution = "72 lp/mm",
                Fom = "2000+",
                TubeType = "White Phosphor",
                ThumbnailUrl = "/images/products/pvs-31.jpg",
                ImageUrls = new List<string> { "/images/products/pvs-31.jpg" },
                Specifications = new Dictionary<string, string>
                {
                    { "Weight", "700g" },
                    { "Field of View", "40°" },
                    { "Magnification", "1x" },
                    { "Battery Life", "25+ hours" },
                    { "Waterproof", "Yes (IP68)" },
                    { "Origin", "Israel" }
                },
                IsActive = true
            },
            new Product
            {
                Name = "PVS-31",
                NameHebrew = "PVS-31",
                Sku = "PVS-31",
                Description = "Compact dual-tube night vision system with exceptional ergonomics. Features individual eyepiece focus and lightweight design.",
                DescriptionHebrew = "מערכת ראיית לילה דו עינית קומפקטית עם ארגונומיה יוצאת דופן. כוללת מיקוד עינית אינדיבידואלי ועיצוב קל משקל.",
                Price = 11500.00M,
                CategoryId = 1,
                ProductType = "binocular",
                InStock = true,
                StockQuantity = 2,
                Generation = "Gen 3",
                Resolution = "72 lp/mm",
                Fom = "2200+",
                TubeType = "White Phosphor",
                ThumbnailUrl = "/images/products/pvs-31.jpg",
                ImageUrls = new List<string> { "/images/products/pvs-31.jpg" },
                Specifications = new Dictionary<string, string>
                {
                    { "Weight", "490g" },
                    { "Field of View", "40°" },
                    { "Magnification", "1x" },
                    { "Battery Life", "30+ hours" },
                    { "Waterproof", "Yes (IP67)" }
                },
                IsActive = true
            },
            new Product
            {
                Name = "AN/PVS-7",
                NameHebrew = "AN/PVS-7",
                Sku = "ANPVS-7",
                Description = "Military standard night vision goggles. Dual-tube system with proven reliability and performance.",
                DescriptionHebrew = "משקפי ראיית לילה בתקן צבאי. מערכת דו עינית עם אמינות וביצועים מוכחים.",
                Price = 4200.00M,
                CategoryId = 1,
                ProductType = "binocular",
                InStock = true,
                StockQuantity = 8,
                Generation = "Gen 3",
                Resolution = "64 lp/mm",
                Fom = "1700+",
                TubeType = "Green Phosphor",
                ThumbnailUrl = "/images/products/pvs-31.jpg",
                ImageUrls = new List<string> { "/images/products/pvs-31.jpg" },
                Specifications = new Dictionary<string, string>
                {
                    { "Weight", "620g" },
                    { "Field of View", "40°" },
                    { "Magnification", "1x" },
                    { "Battery Life", "12+ hours" },
                    { "Waterproof", "Yes (IP67)" }
                },
                IsActive = true
            }
        };

        context.Products.AddRange(products);
        context.SaveChanges();

        SeedThermalCategoryAndProducts(context);
        SeedBuilderComponentProducts(context);
        AssignRealProductPhotos(context);
        BackfillMissingProductImages(context);
    }

    // Assigns real, internet-sourced product photos (stored locally under
    // /images/products) to specific SKUs, replacing generic banner fallbacks.
    // Idempotent: only updates products whose thumbnail differs.
    private static void AssignRealProductPhotos(AppDbContext context)
    {
        var photoBySku = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "THM-JERRY-C-JC5", "/images/products/jerry-c5.png" },
            { "THM-JERRY-C-JC5PRO", "/images/products/jerry-c5.png" },
            { "THM-JERRY-CE", "/images/products/jerry-c5.png" },
            { "THM-RICO-MICRO", "/images/products/rico-micro.jpg" },
            { "THM-RICO-MK1", "/images/products/rico-mk1.jpg" },
            { "THM-CLIP-CH50", "/images/products/clip-ch50.jpg" },
            { "THM-MATE-MAL38", "/images/products/clip-ch50.jpg" },
            { "BLD-HSG-RNVG", "/images/products/pvs-31.jpg" },
            { "BLD-HSG-DTNVS", "/images/products/dtnvs.jpg" },
            { "BLD-HSG-ARGUS-BNVD", "/images/products/bnvd-1431.jpg" },
            { "BLD-HSG-CHIM-AL", "/images/products/chimera.png" },
            { "BLD-HSG-GPNVG", "/images/products/gpnvg-18.jpg" },
            { "BLD-HSG-APNVG", "/images/products/apnvg.jpg" },
            { "BLD-HSG-PVS14", "/images/products/pvs-14.jpg" },
            { "BLD-HSG-MONO-UL", "/images/products/pvs-14.jpg" },
            { "BNVD-1431", "/images/products/bnvd-1431.jpg" },
            { "BLD-TUBE-ECHO", "/images/products/intensifier-tube.jpg" },
            { "BLD-TUBE-4G", "/images/products/intensifier-tube.jpg" },
            { "BLD-TUBE-ELBIT-GRN", "/images/products/intensifier-tube.jpg" },
            { "BLD-TUBE-ELBIT-XLSH", "/images/products/intensifier-tube.jpg" },
            { "BLD-TUBE-L3-UNF", "/images/products/intensifier-tube.jpg" },
            { "BLD-MOUNT-G24", "/images/products/g24-mount.jpg" },
            { "BLD-OBJ-1X", "/images/products/objective-lens.jpg" },
            { "BLD-OBJ-3X", "/images/products/objective-lens.jpg" },
            { "BLD-OBJ-RPO-3", "/images/products/rpo-lens.jpg" },
            { "BLD-OBJ-RPO-4", "/images/products/rpo-lens.jpg" },
            { "BLD-EYE-STD", "/images/products/eyepiece-lens.jpg" },
            { "BLD-EYE-WIDE", "/images/products/eyepiece-lens.jpg" },
            { "BLD-IR-850", "/images/products/ir-940.png" },
            { "BLD-IR-940", "/images/products/ir-940.png" },
            { "BLD-BAT-ONBOARD", "/images/products/battery-pack.jpg" },
            { "BLD-BAT-EXT", "/images/products/battery-pack.jpg" },
            { "PVS-14", "/images/products/pvs-14.jpg" },
            { "PVS-31", "/images/products/pvs-31.jpg" },
        };

        var toUpdate = context.Products
            .AsEnumerable()
            .Where(p => photoBySku.ContainsKey(p.Sku))
            .ToList();

        var changed = false;
        foreach (var product in toUpdate)
        {
            var url = photoBySku[product.Sku];
            if (product.ThumbnailUrl != url)
            {
                product.ThumbnailUrl = url;
                product.ImageUrls = new List<string> { url };
                changed = true;
            }
        }

        if (changed) context.SaveChanges();
    }

    // Assigns a representative category image to any product that has no photo,
    // so nothing in the catalog renders without an image. Idempotent.
    private static void BackfillMissingProductImages(AppDbContext context)
    {
        var fallbackByType = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "intensifier", "/images/banners/image-intensifier.jpg" },
            { "optics", "/images/banners/optics.jpg" },
            { "accessories", "/images/banners/accessories.jpg" },
            { "housing", "/images/banners/night-vision.jpg" },
            { "thermal", "/images/banners/night-vision.jpg" },
            { "monocular", "/images/products/pvs-14.jpg" },
            { "binocular", "/images/products/pvs-31.jpg" },
            { "panoramic", "/images/products/quads.jpg" },
        };
        const string genericFallback = "/images/banners/night-vision.jpg";

        var missing = context.Products
            .Where(p => p.ThumbnailUrl == null || p.ThumbnailUrl == "")
            .ToList();

        if (missing.Count == 0) return;

        foreach (var product in missing)
        {
            var url = product.ProductType != null && fallbackByType.TryGetValue(product.ProductType, out var mapped)
                ? mapped
                : genericFallback;
            product.ThumbnailUrl = url;
            if (product.ImageUrls.Count == 0)
            {
                product.ImageUrls = new List<string> { url };
            }
        }

        context.SaveChanges();
    }

    // Seeds the Thermal category and clip-on / thermal imaging products
    // (Jerry-C series by InfiRay, plus InfiRay RICO / Clip series).
    // Idempotent: skips if the category or SKUs already exist.
    private static void SeedThermalCategoryAndProducts(AppDbContext context)
    {
        var thermalCategory = context.Categories.FirstOrDefault(c => c.Name == "Thermal");
        if (thermalCategory == null)
        {
            thermalCategory = new Category
            {
                Name = "Thermal",
                NameHebrew = "תרמי",
                Description = "Thermal imaging devices and clip-on systems",
                DescriptionHebrew = "מכשירי הדמיה תרמית ומערכות קליפ-און",
                DisplayOrder = 6,
                IsActive = true
            };
            context.Categories.Add(thermalCategory);
            context.SaveChanges();
        }

        var thermalId = thermalCategory.Id;

        var items = new (string Sku, string Name, string NameHe, string Desc, string DescHe, decimal Price, Dictionary<string, string> Specs)[]
        {
            ("THM-JERRY-C-JC5", "InfiRay Jerry-C C5 Fusion Clip-On", "InfiRay Jerry-C C5 קליפ-און פיוז'ן",
                "Thermal fusion clip-on (COTI) for night vision. 640x512 12μm sensor, mounts in front of the NVG objective to overlay thermal on the intensified image.",
                "קליפ-און תרמי לפיוז׳ן עם ראיית לילה (COTI). חיישן 640x512 12 מיקרון, מתחבר לפני העדשה הקדמית ומשלב תמונה תרמית על גבי מגבר האור.",
                24500M,
                new() { { "Sensor", "640x512 @ 12μm" }, { "Frame Rate", "50Hz" }, { "Mount", "Clip-on (NVG objective)" }, { "Battery", "CR123 / 18350" } }),
            ("THM-JERRY-C-JC5PRO", "InfiRay Jerry-C CE5 Fusion Clip-On (Enhanced)", "InfiRay Jerry-C CE5 קליפ-און פיוז'ן משופר",
                "Enhanced Jerry-C fusion clip-on with 640x512 12μm sensor and improved outline/fusion display modes for helmet-mounted NVGs.",
                "גרסת Jerry-C משופרת עם חיישן 640x512 12 מיקרון ומצבי תצוגת קווי מתאר/פיוז׳ן משופרים לראיית לילה מורכבת קסדה.",
                27900M,
                new() { { "Sensor", "640x512 @ 12μm" }, { "Frame Rate", "50Hz" }, { "Mount", "Clip-on (NVG objective)" }, { "Battery", "CR123 / 18350" } }),
            ("THM-JERRY-CE", "InfiRay Jerry-C C2 Fusion Clip-On", "InfiRay Jerry-C C2 קליפ-און פיוז'ן",
                "Entry Jerry-C fusion clip-on with 256x192 12μm sensor — lightweight thermal overlay module for helmet-mounted night vision.",
                "קליפ-און פיוז׳ן מסדרת Jerry-C ברמת כניסה עם חיישן 256x192 12 מיקרון — מודול תרמי קל משקל לראיית לילה מורכבת קסדה.",
                12800M,
                new() { { "Sensor", "256x192 @ 12μm" }, { "Frame Rate", "50Hz" }, { "Mount", "Clip-on (NVG objective)" } }),
            ("THM-RICO-MICRO", "InfiRay RICO Micro RH25 Thermal Monocular", "InfiRay RICO Micro RH25 חד עיני תרמי",
                "Ultra-compact 640x512 12μm thermal monocular, helmet or handheld. 25mm lens, up to ~1300m detection.",
                "חד עיני תרמי אולטרה-קומפקטי 640x512 12 מיקרון, לקסדה או ליד. עדשת 25 מ״מ, גילוי עד ~1300 מ׳.",
                17900M,
                new() { { "Sensor", "640x512 @ 12μm" }, { "Lens", "25mm F/1.0" }, { "Detection", "~1300m" }, { "Weight", "~250g" }, { "Display", "1024x768 OLED" } }),
            ("THM-RICO-MK1", "InfiRay RICO Mk1 640 3X 50mm Thermal Weapon Sight", "InfiRay RICO Mk1 640 3X 50mm כוונת תרמית",
                "RICO Mk1 (RH50) 640x512 12μm thermal weapon sight with 50mm lens, ~2600yd detection, onboard recording, 1024x768 OLED display.",
                "כוונת תרמית RICO Mk1 (RH50)‎ עם חיישן 640x512 12 מיקרון ועדשת 50 מ״מ, טווח גילוי ~2400 מ׳, הקלטה מובנית, תצוגת OLED 1024x768.",
                26900M,
                new() { { "Sensor", "640x512 @ 12μm" }, { "Lens", "50mm F/1.0" }, { "Detection", "~2400m" }, { "Display", "1024x768 OLED" }, { "Recording", "Onboard photo/video" } }),
            ("THM-CLIP-CH50", "InfiRay Clip CH50 V2 Weapon Clip-On", "InfiRay Clip CH50 V2 קליפ-און לנשק",
                "Weapon-mounted thermal clip-on, 640x512 12μm, 50mm germanium lens, attaches in front of day optics up to 6x.",
                "קליפ-און תרמי לנשק, 640x512 12 מיקרון, עדשת גרמניום 50 מ״מ, מתחבר לפני כוונות יום עד הגדלה 6x.",
                32500M,
                new() { { "Sensor", "640x512 @ 12μm" }, { "Lens", "50mm germanium" }, { "Day Optic", "Up to 6x" }, { "Weight", "~620g" }, { "Recoil Rated", "Yes" } }),
            ("THM-MATE-MAL38", "InfiRay MATE MAL38 Thermal Clip-On", "InfiRay MATE MAL38 קליפ-און תרמי",
                "MATE series weapon-mounted thermal clip-on with 384x288 12μm sensor and 38mm lens — thermal front attachment for day scopes.",
                "קליפ-און תרמי לנשק מסדרת MATE, חיישן 384x288 12 מיקרון ועדשת 38 מ״מ — תוספת תרמית לכוונות יום.",
                18900M,
                new() { { "Sensor", "384x288 @ 12μm" }, { "Lens", "38mm F/1.0" }, { "Mount", "Weapon clip-on (day scope)" } }),
        };

        var existingSkus = context.Products
            .Select(p => p.Sku)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Sync text/specs on existing rows so fact-check corrections self-heal.
        var itemBySku = items.ToDictionary(i => i.Sku, StringComparer.OrdinalIgnoreCase);
        var existingRows = context.Products
            .AsEnumerable()
            .Where(p => itemBySku.ContainsKey(p.Sku))
            .ToList();
        var textChanged = false;
        foreach (var row in existingRows)
        {
            var i = itemBySku[row.Sku];
            if (row.Name != i.Name || row.NameHebrew != i.NameHe ||
                row.Description != i.Desc || row.DescriptionHebrew != i.DescHe)
            {
                row.Name = i.Name;
                row.NameHebrew = i.NameHe;
                row.Description = i.Desc;
                row.DescriptionHebrew = i.DescHe;
                row.Specifications = i.Specs;
                textChanged = true;
            }
        }
        if (textChanged) context.SaveChanges();

        var newProducts = items
            .Where(i => !existingSkus.Contains(i.Sku))
            .Select(i => new Product
            {
                Name = i.Name,
                NameHebrew = i.NameHe,
                Sku = i.Sku,
                Description = i.Desc,
                DescriptionHebrew = i.DescHe,
                Price = i.Price,
                CategoryId = thermalId,
                ProductType = "thermal",
                InStock = true,
                StockQuantity = 5,
                IsActive = true,
                Specifications = i.Specs,
            })
            .ToList();

        if (newProducts.Count > 0)
        {
            context.Products.AddRange(newProducts);
            context.SaveChanges();
        }
    }

    // Seeds every custom-builder component as a standalone product,
    // categorized to match the store: Night Vision, Image Intensifier Tubes, Optics, Accessories, Spare Parts.
    // Idempotent: skips products whose SKU already exists.
    private static void SeedBuilderComponentProducts(AppDbContext context)
    {
        int CatId(string name) => context.Categories.First(c => c.Name == name).Id;
        int tubes, optics, accessories, spareParts;
        try
        {
            tubes = CatId("Image Intensifier Tubes");
            optics = CatId("Optics");
            accessories = CatId("Accessories");
            spareParts = CatId("Spare Parts");
        }
        catch (InvalidOperationException)
        {
            return; // categories not present; skip
        }

        var items = new (string Sku, string Name, string NameHe, string Desc, string DescHe, decimal Price, int CategoryId, string ProductType, string? Gen, string? Fom, string? TubeType, Dictionary<string, string> Specs)[]
        {
            // --- Housings (Spare Parts) ---
            ("BLD-HSG-PVS14", "PVS-14 Mil-Spec Housing", "גוף PVS-14 Mil-Spec",
                "Proven mil-spec monocular housing with the widest accessory compatibility on the market.",
                "גוף חד עיני בתקן צבאי מוכח, תואם רוב האביזרים בשוק.",
                2900M, spareParts, "housing", null, null, null,
                new() { { "Weight", "180g" }, { "Form Factor", "Monocular" } }),
            ("BLD-HSG-MONO-UL", "Nocturn Talon Ultralight Monocular Housing", "גוף חד עיני Nocturn Talon אולטרה-קל",
                "Nocturn Industries Talon ultralight monocular housing — minimal weight for helmet use, PVS-14 spec optics compatible.",
                "גוף חד עיני Talon של Nocturn Industries — קל במיוחד להרכבת קסדה, תואם אופטיקת PVS-14.",
                4400M, spareParts, "housing", null, null, null,
                new() { { "Weight", "~130g" }, { "Form Factor", "Monocular" }, { "Optics", "PVS-14 spec" } }),
            ("BLD-HSG-RNVG", "RNVG — Rugged Fixed Bridge Housing", "RNVG — גוף גשר קשיח",
                "Fixed aluminum bridge binocular housing for maximum durability.",
                "גוף דו עיני עם גשר קבוע מאלומיניום, עמידות מקסימלית.",
                7400M, spareParts, "housing", null, null, null,
                new() { { "Weight", "460g" }, { "Form Factor", "Binocular" }, { "Bridge", "Fixed" } }),
            ("BLD-HSG-DTNVS", "DTNVS — Articulating Bridge Housing", "DTNVS — גוף גשר מתקפל",
                "Binocular housing with individual flip-up pods and auto shut-off.",
                "גוף דו עיני עם פודים מתקפלים לצדדים וניתוק אוטומטי.",
                9250M, spareParts, "housing", null, null, null,
                new() { { "Weight", "420g" }, { "Form Factor", "Binocular" }, { "Bridge", "Articulating" } }),
            ("BLD-HSG-ARGUS-BNVD", "Argus MK2 BNVD 1431 Housing", "גוף Argus MK2 BNVD 1431",
                "Articulating bridge binocular housing, lightweight modular build.",
                "גוף דו עיני עם גשר מתקפל, מבנה קל ומודולרי.",
                8600M, spareParts, "housing", null, null, null,
                new() { { "Weight", "440g" }, { "Form Factor", "Binocular" }, { "Bridge", "Articulating" } }),
            ("BLD-HSG-CHIM-AL", "Nocturn Chimera Housing (U.A.P.N.V.G.)", "גוף Nocturn Chimera (U.A.P.N.V.G.)",
                "Nocturn Industries U.A.P.N.V.G. Chimera articulating panoramic housing, 7075-T6 aluminum, individual pod on/off, lifetime warranty.",
                "גוף ארבע-עיני מפרקי Chimera של Nocturn Industries, אלומיניום 7075-T6, כיבוי פוד עצמאי, אחריות לכל החיים.",
                14800M, spareParts, "housing", null, null, null,
                new() { { "VariantGroup", "chimera-housing" }, { "VariantLabel", "Aluminum (7075-T6)|אלומיניום (7075-T6)" }, { "Material", "7075-T6 Aluminum" }, { "Form Factor", "Panoramic (articulating)" }, { "Warranty", "Lifetime" }, { "Optics", "PVS-14 spec / 18mm MX" } }),
            ("BLD-HSG-CHIM-MG", "Nocturn Chimera Housing — Magnesium", "גוף Nocturn Chimera — מגנזיום",
                "Nocturn Industries U.A.P.N.V.G. Chimera articulating panoramic housing, magnesium alloy — lighter weight, premium variant.",
                "גוף ארבע-עיני מפרקי Chimera של Nocturn Industries, סגסוגת מגנזיום — משקל קל יותר, דגם פרמיום.",
                17200M, spareParts, "housing", null, null, null,
                new() { { "VariantGroup", "chimera-housing" }, { "VariantLabel", "Magnesium|מגנזיום" }, { "Material", "Magnesium alloy" }, { "Form Factor", "Panoramic (articulating)" }, { "Warranty", "Lifetime" }, { "Optics", "PVS-14 spec / 18mm MX" } }),
            ("BLD-HSG-CHIM-PL", "Nocturn Chimera Housing — Polymer", "גוף Nocturn Chimera — פולימר",
                "Nocturn Industries U.A.P.N.V.G. Chimera articulating panoramic housing, reinforced polymer — budget-friendly variant.",
                "גוף ארבע-עיני מפרקי Chimera של Nocturn Industries, פולימר מחוזק — דגם חסכוני.",
                12900M, spareParts, "housing", null, null, null,
                new() { { "VariantGroup", "chimera-housing" }, { "VariantLabel", "Polymer|פולימר" }, { "Material", "Reinforced polymer" }, { "Form Factor", "Panoramic (articulating)" }, { "Warranty", "Lifetime" }, { "Optics", "PVS-14 spec / 18mm MX" } }),
            ("BLD-HSG-GPNVG", "Genuine L3 GPNVG-18 Housing", "גוף L3 GPNVG-18 מקורי",
                "Genuine L3 quad-channel panoramic housing, ~97° FOV. Longer lead time.",
                "גוף ארבע-עיני מקורי של L3 עם ארבעה ערוצים, ~97° שדה ראייה. זמן אספקה ממושך.",
                24500M, spareParts, "housing", null, null, null,
                new() { { "Weight", "620g" }, { "Form Factor", "Panoramic" }, { "Field of View", "~97°" } }),
            ("BLD-HSG-APNVG", "Argus APNVG Housing", "גוף Argus APNVG",
                "Modular panoramic housing with removable outboard channels.",
                "גוף ארבע-עיני מודולרי עם ערוצים חיצוניים ניתנים להסרה.",
                15900M, spareParts, "housing", null, null, null,
                new() { { "Weight", "590g" }, { "Form Factor", "Panoramic" } }),

            // --- Image intensifier tubes ---
            ("BLD-TUBE-ECHO", "Photonis Echo — White Phosphor Tube", "Photonis Echo — שפופרת זרחן לבן",
                "Photonis Echo image intensifier tube, FOM 1600-2000, autogated.",
                "שפופרת מגבר אור Photonis Echo, FOM 1600-2000, autogated.",
                9200M, tubes, "intensifier", "Gen 2+", "1600-2000", "White Phosphor",
                new() { { "Manufacturer", "Photonis" }, { "Weight", "95g" } }),
            ("BLD-TUBE-4G", "Photonis 4G — White Phosphor Tube", "Photonis 4G — שפופרת זרחן לבן",
                "Photonis 4G image intensifier tube, FOM 1800-2300, extended spectral range.",
                "שפופרת מגבר אור Photonis 4G, FOM 1800-2300, ספקטרום מורחב.",
                16600M, tubes, "intensifier", "Gen 2+ (4G)", "1800-2300", "White Phosphor",
                new() { { "Manufacturer", "Photonis" }, { "Weight", "95g" } }),
            ("BLD-TUBE-ELBIT-GRN", "Elbit Gen 3 — Green Phosphor Tube", "Elbit Gen 3 — שפופרת זרחן ירוק",
                "Elbit Gen 3 image intensifier tube, FOM 1600-2000, GaAs photocathode.",
                "שפופרת מגבר אור Elbit Gen 3, FOM 1600-2000, פוטוקתודה GaAs.",
                12600M, tubes, "intensifier", "Gen 3", "1600-2000", "Green Phosphor",
                new() { { "Manufacturer", "Elbit" }, { "Weight", "100g" } }),
            ("BLD-TUBE-ELBIT-XLSH", "Elbit XLSH — White Phosphor Tube", "Elbit XLSH — שפופרת זרחן לבן",
                "Elbit XLSH image intensifier tube, FOM 2000+, high sensitivity.",
                "שפופרת מגבר אור Elbit XLSH, FOM 2000+, רגישות גבוהה.",
                15700M, tubes, "intensifier", "Gen 3", "2000+", "White Phosphor",
                new() { { "Manufacturer", "Elbit" }, { "Weight", "100g" } }),
            ("BLD-TUBE-L3-UNF", "L3Harris Unfilmed — White Phosphor Tube", "L3Harris Unfilmed — שפופרת זרחן לבן",
                "L3Harris unfilmed image intensifier tube, FOM 2300-2600 — top-tier performance.",
                "שפופרת מגבר אור L3Harris ללא סרט יוני, FOM 2300-2600 — הביצועים הגבוהים בשוק.",
                20300M, tubes, "intensifier", "Gen 3", "2300-2600", "White Phosphor",
                new() { { "Manufacturer", "L3Harris" }, { "Weight", "100g" } }),

            // --- Optics ---
            ("BLD-OBJ-1X", "1x Standard Objective Lens", "עדשה קדמית 1x סטנדרטית",
                "Standard 1x objective lens, 40° field of view, F/1.2.",
                "עדשה קדמית סטנדרטית 1x, שדה ראייה 40°, F/1.2.",
                950M, optics, "optics", null, null, null,
                new() { { "Magnification", "1x" }, { "Field of View", "40°" }, { "Weight", "60g" } }),
            ("BLD-OBJ-3X", "3x Magnifier (Screw-On)", "מגדיל 3x (מתברג)",
                "Screw-on 3x magnifier lens, 13° field of view, observation use.",
                "עדשת הגדלה 3x מתברגת, שדה ראייה 13°, לצפייה בלבד.",
                2100M, optics, "optics", null, null, null,
                new() { { "Magnification", "3x" }, { "Field of View", "13°" }, { "Weight", "145g" } }),
            ("BLD-OBJ-RPO-3", "RPO PVS-14 Ultralight Objective Lens (1x)", "RPO — עדשה קדמית אולטרה-קלה 1x",
                "Rochester Precision Optics PVS-14 ultralight objective lens — significantly lighter than mil-spec glass. 1x, no magnification.",
                "עדשה קדמית אולטרה-קלה ל-PVS-14 מבית Rochester Precision Optics — קלה משמעותית מזכוכית Mil-Spec. הגדלה 1x בלבד.",
                3400M, optics, "optics", null, null, null,
                new() { { "Magnification", "1x" }, { "Weight", "~40g" }, { "Brand", "Rochester Precision Optics" } }),
            ("BLD-OBJ-RPO-4", "RPO 4.0 NVD-Next Lightweight Objective (1x)", "RPO 4.0 NVD-Next — עדשה קדמית קלת משקל 1x",
                "RPO NVD-Next Gen 4.0 lightweight PVS-14 objective lens — latest RPO lens line, lighter with improved edge clarity. 1x, no magnification.",
                "עדשה קדמית קלת משקל מסדרת NVD-Next 4.0 של RPO ל-PVS-14 — הדור החדש של RPO, קלה יותר עם חדות משופרת בשוליים. הגדלה 1x בלבד.",
                3900M, optics, "optics", null, null, null,
                new() { { "Magnification", "1x" }, { "Weight", "~35g" }, { "Brand", "Rochester Precision Optics" } }),
            ("BLD-EYE-STD", "Standard Eyepiece Lens", "עדשה אחורית סטנדרטית",
                "Standard eyepiece lens, diopter adjust +2/-6.",
                "עדשה אחורית סטנדרטית, כוונון דיופטר ‎+2/-6.",
                780M, optics, "optics", null, null, null,
                new() { { "Diopter Adjust", "+2/-6" }, { "Weight", "55g" } }),
            ("BLD-EYE-WIDE", "Extended Eye Relief Eyepiece", "עדשה אחורית מרחק עין מוגדל",
                "Extended eye relief eyepiece, compatible with protective eyewear.",
                "עדשה אחורית עם מרחק עין מוגדל, מתאימה למשקפי מגן.",
                1250M, optics, "optics", null, null, null,
                new() { { "Weight", "70g" } }),

            // --- Accessories ---
            ("BLD-BAT-ONBOARD", "Onboard Battery Pack (CR123 / AA)", "מארז סוללה מובנה (CR123 / AA)",
                "Onboard battery pack, ~30-50 hours runtime.",
                "מארז סוללה מובנה, ‎~30-50 שעות פעולה.",
                180M, accessories, "accessories", null, null, null,
                new() { { "Runtime", "~30-50 hours" }, { "Weight", "35g" } }),
            ("BLD-BAT-EXT", "External 4xAA Battery Pack (Counterweight)", "מארז חיצוני 4xAA (משקל-נגד)",
                "External 4xAA battery pack, ~120 hours, doubles as helmet counterweight.",
                "מארז חיצוני 4xAA, ‎~120 שעות, משמש גם כמאזן משקל על הקסדה.",
                740M, accessories, "accessories", null, null, null,
                new() { { "Runtime", "~120 hours" }, { "Weight", "210g" } }),
            ("BLD-MOUNT-G24", "Wilcox L4 G24 Helmet Mount", "תושבת קסדה Wilcox L4 G24",
                "Wilcox L4 G24 low-profile breakaway helmet mount with fine height adjust and quick release.",
                "תושבת קסדה Wilcox L4 G24 פרופיל נמוך, כוונון גובה מדויק, שחרור מהיר.",
                2600M, accessories, "accessories", null, null, null,
                new() { { "Weight", "~115g" }, { "Interface", "Dovetail shoe" }, { "Manufacturer", "Wilcox Industries" } }),
            ("BLD-IR-850", "IR Illuminator 850nm", "מאיר IR 850nm",
                "IR illuminator, ~150m range, slight visible red glow.",
                "מאיר IR, טווח ~150 מ׳, זוהר אדום קל גלוי.",
                890M, accessories, "accessories", null, null, null,
                new() { { "Wavelength", "850nm" }, { "Range", "~150m" }, { "Weight", "65g" } }),
            ("BLD-IR-940", "Covert IR Illuminator 940nm", "מאיר IR 940nm חשאי",
                "Covert IR illuminator, no visible glow, ~100m range.",
                "מאיר IR חשאי, ללא זוהר גלוי, טווח ~100 מ׳.",
                1250M, accessories, "accessories", null, null, null,
                new() { { "Wavelength", "940nm" }, { "Range", "~100m" }, { "Weight", "70g" } }),
        };

        var existingSkus = context.Products
            .Select(p => p.Sku)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Sync text fields on existing rows so corrections in this seed list
        // (or rows corrupted by out-of-band edits, e.g. bad charset) self-heal.
        var itemBySku = items.ToDictionary(i => i.Sku, StringComparer.OrdinalIgnoreCase);
        var existingRows = context.Products
            .AsEnumerable()
            .Where(p => itemBySku.ContainsKey(p.Sku))
            .ToList();
        var textChanged = false;
        foreach (var row in existingRows)
        {
            var i = itemBySku[row.Sku];
            var specsChanged = row.Specifications.Count != i.Specs.Count
                || i.Specs.Any(kv => !row.Specifications.TryGetValue(kv.Key, out var v) || v != kv.Value);
            if (row.Name != i.Name || row.NameHebrew != i.NameHe ||
                row.Description != i.Desc || row.DescriptionHebrew != i.DescHe || specsChanged)
            {
                row.Name = i.Name;
                row.NameHebrew = i.NameHe;
                row.Description = i.Desc;
                row.DescriptionHebrew = i.DescHe;
                row.Specifications = i.Specs;
                textChanged = true;
            }
        }

        // Chimera material variants are sold as one product page with a variant
        // dropdown; make sure previously-retired variant rows are active again.
        var variantSkus = new[] { "BLD-HSG-CHIM-MG", "BLD-HSG-CHIM-PL" };
        foreach (var row in context.Products.AsEnumerable().Where(p => variantSkus.Contains(p.Sku, StringComparer.OrdinalIgnoreCase) && !p.IsActive))
        {
            row.IsActive = true;
            textChanged = true;
        }
        if (textChanged) context.SaveChanges();

        var newProducts = items
            .Where(i => !existingSkus.Contains(i.Sku))
            .Select(i => new Product
            {
                Name = i.Name,
                NameHebrew = i.NameHe,
                Sku = i.Sku,
                Description = i.Desc,
                DescriptionHebrew = i.DescHe,
                Price = i.Price,
                CategoryId = i.CategoryId,
                ProductType = i.ProductType,
                Generation = i.Gen,
                Fom = i.Fom,
                TubeType = i.TubeType,
                InStock = true,
                StockQuantity = 10,
                IsActive = true,
                Specifications = i.Specs,
            })
            .ToList();

        if (newProducts.Count > 0)
        {
            context.Products.AddRange(newProducts);
            context.SaveChanges();
        }
    }

    private static void SeedAdminUser(AppDbContext context, IConfiguration configuration)
    {
        if (context.AdminUsers.Any())
        {
            return; // Admin already provisioned
        }

        var email = configuration["AdminAccount:Email"];
        var password = configuration["AdminAccount:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return; // No admin credentials configured; skip seeding
        }

        var hasher = new PasswordHasher<AdminUser>();
        var admin = new AdminUser
        {
            Email = email,
            PasswordHash = string.Empty
        };
        admin.PasswordHash = hasher.HashPassword(admin, password);

        context.AdminUsers.Add(admin);
        context.SaveChanges();
    }
}
