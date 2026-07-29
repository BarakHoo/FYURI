namespace FYURI.Server.Data;

/// <summary>
/// Server-side source of truth for the custom device builder.
/// Mirrors fyuri.client/src/data/builderData.js — keep both in sync.
/// Used to validate custom-build requests so clients cannot tamper with
/// part identities or prices.
/// </summary>
public static class BuilderCatalog
{
    public record BuilderOption(
        string Id,
        string NameEn,
        string NameHe,
        decimal Price,
        int WeightGrams,
        bool Available,
        string[]? DeviceTypes = null);

    public record BuilderCategory(
        string Id,
        string NameEn,
        string NameHe,
        bool Required,
        bool PerChannel,
        BuilderOption[] Options);

    /// <summary>Device type id -> channel (tube) count.</summary>
    public static readonly IReadOnlyDictionary<string, int> DeviceTypes = new Dictionary<string, int>
    {
        ["monocular"] = 1,
        ["binocular"] = 2,
        ["panoramic"] = 4,
    };

    public static readonly IReadOnlyDictionary<string, string> DeviceTypeNamesEn = new Dictionary<string, string>
    {
        ["monocular"] = "Monocular",
        ["binocular"] = "Binocular",
        ["panoramic"] = "Panoramic",
    };

    public static readonly IReadOnlyDictionary<string, string> DeviceTypeNamesHe = new Dictionary<string, string>
    {
        ["monocular"] = "חד עיניים",
        ["binocular"] = "דו עיניים",
        ["panoramic"] = "ארבע-עיניים",
    };

    public static readonly BuilderCategory[] Categories =
    [
        new BuilderCategory("housing", "Housing / Chassis", "גוף", Required: true, PerChannel: false,
        [
            new("housing-pvs14", "PVS-14 Mil-Spec Housing", "גוף PVS-14 Mil-Spec", 2900m, 180, true, ["monocular"]),
            new("housing-mono-ultralight", "Nocturn Talon Ultralight", "גוף Nocturn Talon אולטרה-קל", 4400m, 130, true, ["monocular"]),
            new("housing-rnvg", "RNVG — Rugged Fixed Bridge", "RNVG — גשר קשיח", 7400m, 460, true, ["binocular"]),
            new("housing-dtnvs", "DTNVS — Articulating Bridge", "DTNVS — גשר מתקפל", 9250m, 420, true, ["binocular"]),
            new("housing-argus-bnvd", "Argus MK2 BNVD 1431", "Argus MK2 BNVD 1431", 8600m, 440, true, ["binocular"]),
            new("housing-chimera-aluminum", "Nocturn Chimera (U.A.P.N.V.G.)", "Nocturn Chimera (U.A.P.N.V.G.)", 14800m, 640, true, ["panoramic"]),
            new("housing-gpnvg", "Genuine L3 GPNVG-18", "L3 GPNVG-18 מקורי", 24500m, 620, true, ["panoramic"]),
            new("housing-argus-apnvg", "Argus APNVG", "Argus APNVG", 15900m, 590, true, ["panoramic"]),
        ]),
        new BuilderCategory("tube", "Image Intensifier Tube", "שפופרת מגבר אור", Required: false, PerChannel: true,
        [
            new("tube-photonis-echo", "Photonis Echo — White Phosphor", "Photonis Echo — זרחן לבן", 9200m, 95, true),
            new("tube-photonis-4g", "Photonis 4G — White Phosphor", "Photonis 4G — זרחן לבן", 16600m, 95, true),
            new("tube-elbit-green", "Elbit Gen 3 — Green Phosphor", "Elbit Gen 3 — זרחן ירוק", 12600m, 100, true),
            new("tube-elbit-xlsh", "Elbit XLSH — White Phosphor", "Elbit XLSH — זרחן לבן", 15700m, 100, true),
            new("tube-l3-unfilmed", "L3Harris Unfilmed — White Phosphor", "L3Harris Unfilmed — זרחן לבן", 20300m, 100, true),
        ]),
        new BuilderCategory("objective", "Objective Lens", "עדשה קדמית", Required: false, PerChannel: true,
        [
            new("obj-1x", "1x Standard", "1x סטנדרטי", 950m, 60, true),
            new("obj-3x", "3x Magnifier (Screw-On)", "מגדיל 3x (מתברג)", 2100m, 145, true),
            new("obj-rpo-3x", "RPO Ultralight Objective (1x)", "RPO — עדשה קדמית אולטרה-קלה 1x", 3400m, 40, true),
            new("obj-rpo-4x", "RPO 4.0 NVD-Next Objective (1x)", "RPO 4.0 NVD-Next — עדשה קדמית 1x", 3900m, 35, true),
        ]),
        new BuilderCategory("eyepiece", "Eyepiece Lens", "עדשה אחורית", Required: false, PerChannel: true,
        [
            new("eye-standard", "Standard Eyepiece", "עדשה אחורית סטנדרטית", 780m, 55, true),
            new("eye-wide", "Extended Eye Relief", "עדשה אחורית מרחק עין מוגדל", 1250m, 70, true),
        ]),
        new BuilderCategory("battery", "Battery Pack", "מארז סוללה", Required: false, PerChannel: false,
        [
            new("bat-onboard", "Onboard (CR123 / AA)", "סוללה מובנית (CR123 / AA)", 180m, 35, true),
            new("bat-ext", "External 4xAA (Counterweight)", "מארז חיצוני 4xAA (משקל-נגד)", 740m, 210, true),
        ]),
        new BuilderCategory("mount", "Mount", "תושבת", Required: false, PerChannel: false,
        [
            new("mount-dovetail-only", "Dovetail Only (Included)", "Dovetail בלבד (כלול)", 0m, 0, true),
            new("mount-g24", "Add G24 Mount", "הוסף תושבת G24", 2600m, 115, true),
        ]),
        new BuilderCategory("illuminator", "IR Illuminator", "מאיר IR", Required: false, PerChannel: false,
        [
            new("ir-none", "None", "ללא", 0m, 0, true),
            new("ir-850", "IR Illuminator 850nm", "מאיר IR 850nm", 890m, 65, true),
            new("ir-940", "Covert IR Illuminator 940nm", "מאיר IR 940nm חשאי", 1250m, 70, true),
        ]),
    ];

    public static BuilderCategory? FindCategory(string id) =>
        Categories.FirstOrDefault(c => c.Id == id);

    public static BuilderOption? FindOption(BuilderCategory category, string optionId, string deviceType) =>
        category.Options.FirstOrDefault(o =>
            o.Id == optionId && (o.DeviceTypes == null || o.DeviceTypes.Contains(deviceType)));
}
