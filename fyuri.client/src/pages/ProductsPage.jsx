import { useEffect, useMemo, useState } from 'react';
import {
  BuildOutlined,
  ChevronLeft,
  ChevronRight,
  Close,
  Favorite,
  FavoriteBorder,
  FilterList,
  GridView,
  HandymanOutlined,
  HeadsetMicOutlined,
  List as ListIcon,
  MemoryOutlined,
  Remove,
  ScienceOutlined,
  SettingsOutlined,
  ShieldOutlined,
  ThermostatOutlined,
  TuneOutlined,
  ViewColumnOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { CircularProgress, Drawer, IconButton } from '@mui/material';
import {
  Link as RouterLink,
  useLocation,
  useSearchParams,
} from 'react-router';
import { resolveAssetUrl } from '../apiConfig';
import { productCategories } from '../components/navigationConfig';
import { useLanguage } from '../context/LanguageContext';
import { getBuilderUrl } from '../data/builderPresets';
import './ProductsPage.css';

const categoryOrder = [
  'monocular',
  'binocular',
  'panoramic',
  'intensifier',
  'optics',
  'thermal',
  'housing',
  'accessories',
];

const categoryIcons = {
  monocular: VisibilityOutlined,
  binocular: VisibilityOutlined,
  panoramic: ViewColumnOutlined,
  intensifier: SettingsOutlined,
  optics: HandymanOutlined,
  thermal: ThermostatOutlined,
  housing: BuildOutlined,
  accessories: MemoryOutlined,
};

const generationOptions = [
  { key: '3', label: 'Gen 3' },
  { key: '2-plus', label: 'Gen 2+' },
  { key: '2', label: 'Gen 2' },
];

const tubeOptions = [
  {
    key: 'white-phosphor',
    value: 'white phosphor',
    label: { he: 'זרחן לבן', en: 'White phosphor' },
  },
  {
    key: 'green-phosphor',
    value: 'green phosphor',
    label: { he: 'זרחן ירוק', en: 'Green phosphor' },
  },
];

const categoryContent = {
  all: {
    title: { he: 'מערכות ראיית לילה', en: 'NIGHT VISION SYSTEMS' },
    category: { he: 'כל המוצרים', en: 'All products' },
    tagline: {
      he: 'קומפקטי. עוצמתי. מוכן למשימה.',
      en: 'Compact. Capable. Mission ready.',
    },
    description: {
      he: 'מערכות, רכיבים ואופטיקה מקצועית שנבנו לבהירות, אמינות וביצועים בשטח.',
      en: 'Professional systems, components and optics built for clarity, reliability, and real-world performance.',
    },
  },
  monocular: {
    title: { he: 'חד עיניים', en: 'MONOCULARS' },
    category: { he: 'חד עיניים', en: 'Monoculars' },
    tagline: {
      he: 'קומפקטי. עוצמתי. מוכן למשימה.',
      en: 'Compact. Capable. Mission ready.',
    },
    description: {
      he: 'מכשירי ראיית לילה חד-עיניים מקצועיים לבהירות, אמינות וביצועים בשטח.',
      en: 'Professional-grade night vision monoculars built for clarity, reliability, and real-world performance.',
    },
  },
  binocular: {
    title: { he: 'דו עיניים', en: 'BINOCULARS' },
    category: { he: 'דו עיניים', en: 'Binoculars' },
    tagline: {
      he: 'עומק, איזון וביצועים לאורך כל הלילה.',
      en: 'Depth, balance. All-night performance.',
    },
    description: {
      he: 'מערכות דו-עיניות מקצועיות עם ארגונומיה מדויקת וביצועים מוכחים.',
      en: 'Professional dual-eye systems with balanced ergonomics and proven low-light performance.',
    },
  },
  panoramic: {
    title: { he: 'מערכות פנורמיות', en: 'PANORAMIC SYSTEMS' },
    category: { he: 'פנורמי', en: 'Panoramic' },
    tagline: {
      he: 'מודעות היקפית ללא פשרות.',
      en: 'Situational awareness without compromise.',
    },
    description: {
      he: 'מערכות רחבות-שדה למשימות שבהן כל פרט בקצה התמונה חשוב.',
      en: 'Wide-field systems for missions where every peripheral detail matters.',
    },
  },
  intensifier: {
    title: { he: 'מגברי אור', en: 'IMAGE INTENSIFIERS' },
    category: { he: 'מגברי אור', en: 'Image intensifiers' },
    tagline: {
      he: 'איכות התמונה מתחילה בשפופרת.',
      en: 'Image quality starts at the tube.',
    },
    description: {
      he: 'שפופרות דור 2+ ודור 3 בזרחן לבן או ירוק וברמות ביצועים שונות.',
      en: 'Gen 2+ and Gen 3 tubes in white or green phosphor across multiple performance tiers.',
    },
  },
  optics: {
    title: { he: 'עדשות ואופטיקה', en: 'LENSES & OPTICS' },
    category: { he: 'עדשות ואופטיקה', en: 'Lenses & optics' },
    tagline: { he: 'בהירות מקצה לקצה.', en: 'Clarity from edge to edge.' },
    description: {
      he: 'עדשות קדמיות, עיניות ומגדילים לבנייה, שדרוג ותחזוקת מערכות.',
      en: 'Objectives, eyepieces and magnifiers selected for builds, upgrades, and maintenance.',
    },
  },
  thermal: {
    title: { he: 'מערכות תרמיות', en: 'THERMAL SYSTEMS' },
    category: { he: 'תרמי', en: 'Thermal' },
    tagline: {
      he: 'לזהות את מה שהחושך לא מסתיר.',
      en: 'Detect what darkness cannot hide.',
    },
    description: {
      he: 'מונוקולרים וקליפ-אונים תרמיים לתצפית ושילוב עם אופטיקת יום.',
      en: 'Thermal monoculars and clip-ons for observation, fusion, and day-optic integration.',
    },
  },
  housing: {
    title: { he: 'גופים', en: 'HOUSINGS' },
    category: { he: 'גופים', en: 'Housings' },
    tagline: {
      he: 'הפלטפורמה הנכונה לבנייה מדויקת.',
      en: 'The right platform for a precise build.',
    },
    description: {
      he: 'גופים לחד-עיני, דו-עיני ופנורמי עם אפשרויות חומר ותצורה.',
      en: 'Monocular, binocular, and panoramic housings with multiple material and configuration options.',
    },
  },
  accessories: {
    title: { he: 'אביזרים', en: 'ACCESSORIES' },
    category: { he: 'אביזרים', en: 'Accessories' },
    tagline: {
      he: 'כל מה שמחבר את המערכת למשימה.',
      en: 'Everything that connects the system to the mission.',
    },
    description: {
      he: 'תושבות, סוללות, מאירים ורכיבים משלימים למערכת מוכנה לשטח.',
      en: 'Mounts, power, illuminators, and supporting components for a field-ready system.',
    },
  },
};

const referenceImages = {
  'pvs-14': '/images/catalog/pvs-14-reference.webp',
  'pvs-14 pro': '/images/catalog/pvs-14-pro-reference.webp',
  'pvs-14 lite': '/images/catalog/pvs-14-lite-reference.webp',
  'an/pvs-7': '/images/catalog/pvs-7-reference.webp',
  'pvs-7': '/images/catalog/pvs-7-reference.webp',
};

const normalizeName = (value) => String(value || '').trim().toLowerCase();

const normalizeGeneration = (value) => {
  const normalized = String(value || '').toLowerCase().replace(/\s/g, '');
  if (normalized.includes('3')) return '3';
  if (normalized.includes('2+')) return '2-plus';
  if (normalized.includes('2')) return '2';
  return '';
};

const normalizeTube = (value) => String(value || '').trim().toLowerCase();

const localizedName = (product, language) => (
  language === 'he'
    ? (product.nameHebrew || product.name || '')
    : (product.name || product.nameHebrew || '')
);

const localizedDescription = (product, language, t) => {
  const description = language === 'he'
    ? (product.descriptionHebrew || product.description)
    : (product.description || product.descriptionHebrew);

  if (description) return description;

  const specValues = Object.values(product.specifications || {}).filter(Boolean);
  if (specValues.length > 0) return specValues.slice(0, 2).join(' · ');

  return t({
    he: 'ציוד מקצועי שנבחר ונבדק על ידי צוות FYURI.',
    en: 'Professional equipment selected and tested by the FYURI team.',
  });
};

const productImage = (product) => {
  const reference = referenceImages[normalizeName(product.name)];
  if (reference) return { src: reference, reference: true };

  return {
    src: resolveAssetUrl(product.thumbnailUrl || product.imageUrls?.[0]),
    reference: false,
  };
};

const productStock = (product, t) => {
  if (!product.inStock || Number(product.stockQuantity || 0) <= 0) {
    return {
      label: t({ he: 'אזל מהמלאי', en: 'Out of stock' }),
      tone: 'out',
    };
  }

  if (Number(product.stockQuantity || 0) <= 3) {
    return {
      label: t({ he: 'מלאי נמוך', en: 'Low stock' }),
      tone: 'low',
    };
  }

  return {
    label: t({ he: 'במלאי', en: 'In stock' }),
    tone: 'in',
  };
};

function FilterPanel({
  activeCategory,
  categoryCounts,
  generationCounts,
  onCategoryChange,
  onClose,
  onGenerationToggle,
  onTubeToggle,
  selectedGenerations,
  selectedTubes,
  setTubeQualityOpen,
  t,
  tubeCounts,
  tubeQualityOpen,
}) {
  const categoryRows = [
    {
      value: '',
      label: t({ he: 'כל המוצרים', en: 'All products' }),
      icon: TuneOutlined,
      count: Object.values(categoryCounts).reduce((sum, count) => sum + count, 0),
    },
    ...categoryOrder.map((value) => {
      const category = productCategories.find((item) => item.value === value);
      return {
        value,
        label: category ? t(category.label) : value,
        icon: categoryIcons[value] || TuneOutlined,
        count: categoryCounts[value] || 0,
      };
    }),
  ];

  return (
    <div className={`reference-filter-panel${tubeQualityOpen ? ' is-expanded' : ''}`}>
      {onClose && (
        <div className="reference-filter-panel__mobile-head">
          <strong>{t({ he: 'סינון', en: 'FILTERS' })}</strong>
          <IconButton
            aria-label={t({ he: 'סגירת מסננים', en: 'Close filters' })}
            onClick={onClose}
          >
            <Close />
          </IconButton>
        </div>
      )}

      <section className="reference-filter-section">
        <div className="reference-filter-title">
          <span>{t({ he: 'קטגוריות', en: 'CATEGORIES' })}</span>
          <Remove aria-hidden="true" />
        </div>
        <div className="reference-filter-rows">
          {categoryRows.map(({ count, icon: RowIcon, label, value }) => {
            const active = activeCategory === value;
            return (
              <button
                type="button"
                className={active ? 'is-active' : undefined}
                key={value || 'all'}
                aria-pressed={active}
                onClick={() => onCategoryChange(value)}
              >
                <RowIcon aria-hidden="true" />
                <span>{label}</span>
                <b>{count}</b>
              </button>
            );
          })}
        </div>
      </section>

      <section className="reference-filter-section reference-filter-section--generation">
        <div className="reference-filter-title">
          <span>{t({ he: 'דור', en: 'GENERATION' })}</span>
          <Remove aria-hidden="true" />
        </div>
        {generationOptions.map((option) => (
          <label key={option.key}>
            <input
              type="checkbox"
              checked={selectedGenerations.has(option.key)}
              onChange={() => onGenerationToggle(option.key)}
            />
            <span>{option.label}</span>
            <b>{generationCounts[option.key] || 0}</b>
          </label>
        ))}
      </section>

      <section className="reference-filter-section reference-filter-section--collapsed">
        <button
          type="button"
          className="reference-filter-title reference-filter-title--button"
          aria-expanded={tubeQualityOpen}
          aria-controls="reference-tube-quality"
          onClick={() => setTubeQualityOpen((open) => !open)}
        >
          <span>{t({ he: 'איכות שפופרת', en: 'TUBE QUALITY' })}</span>
          <b aria-hidden="true">{tubeQualityOpen ? '−' : '+'}</b>
        </button>
        {tubeQualityOpen && (
          <div
            id="reference-tube-quality"
            className="reference-filter-section--generation reference-filter-suboptions"
          >
            {tubeOptions.map((option) => (
              <label key={option.key}>
                <input
                  type="checkbox"
                  checked={selectedTubes.has(option.key)}
                  onChange={() => onTubeToggle(option.key)}
                />
                <span>{t(option.label)}</span>
                <b>{tubeCounts[option.key] || 0}</b>
              </label>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProductImage({ name, product }) {
  const [failed, setFailed] = useState(false);
  const image = productImage(product);

  if (!image.src || failed) {
    return (
      <div className="reference-product-card__image-fallback" role="img" aria-label={name}>
        <VisibilityOutlined aria-hidden="true" />
        <span>FYURI</span>
      </div>
    );
  }

  return (
    <img
      className={image.reference ? undefined : 'reference-product-card__source-image'}
      src={image.src}
      alt={name}
      width="1600"
      height="960"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function ProductCard({
  catalogUrl,
  favorite,
  language,
  onFavorite,
  product,
  t,
}) {
  const name = localizedName(product, language);
  const description = localizedDescription(product, language, t);
  const stock = productStock(product, t);
  const builderUrl = getBuilderUrl(product);
  const price = new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(Number(product.price || 0));

  return (
    <article
      className="reference-product-card"
      data-testid="catalog-product-card"
      role="listitem"
    >
      <div className="reference-product-card__media">
        <RouterLink
          className="reference-product-card__media-link"
          to={`/products/${product.id}`}
          state={{ catalogUrl }}
          aria-label={t({
            he: `צפייה בפרטי ${name}`,
            en: `View details for ${name}`,
          })}
        >
          <ProductImage name={name} product={product} />
        </RouterLink>
        <button
          type="button"
          className="reference-product-card__favorite"
          aria-label={t({
            he: favorite ? `הסרת ${name} מהמועדפים` : `שמירת ${name} במועדפים`,
            en: favorite ? `Remove ${name} from favorites` : `Save ${name} to favorites`,
          })}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          {favorite ? <Favorite /> : <FavoriteBorder />}
        </button>
      </div>

      <div className="reference-product-card__body">
        <h2>
          <RouterLink to={`/products/${product.id}`} state={{ catalogUrl }}>
            {name}
          </RouterLink>
        </h2>
        <p>{description}</p>

        <div className="reference-product-card__chips">
          {product.generation && (
            <span className="reference-chip reference-chip--generation">
              {product.generation}
            </span>
          )}
          <span className={`reference-chip reference-chip--${stock.tone}`}>
            {stock.label}
          </span>
        </div>

        <div className="reference-product-card__price">
          <span>{t({ he: 'החל מ-', en: 'Starting at' })}</span>
          <strong><i>₪</i>{price}</strong>
        </div>

        <div className="reference-product-card__actions">
          <RouterLink
            to={`/products/${product.id}`}
            state={{ catalogUrl }}
            className="reference-button reference-button--outline"
          >
            {t({ he: 'פרטים נוספים', en: 'VIEW DETAILS' })}
          </RouterLink>
          {builderUrl ? (
            <RouterLink
              to={builderUrl}
              className="reference-button reference-button--primary"
              data-testid={`configure-product-${product.id}`}
            >
              {t({ he: 'התאמה אישית', en: 'CONFIGURE' })}
            </RouterLink>
          ) : (
            <RouterLink
              to={`/contact?product=${encodeURIComponent(name)}`}
              className="reference-button reference-button--primary"
            >
              {t({ he: 'דברו עם מומחה', en: 'ASK AN EXPERT' })}
            </RouterLink>
          )}
        </div>
      </div>
    </article>
  );
}

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [tubeQualityOpen, setTubeQualityOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('fyuri-favorites') || '[]'));
    } catch {
      return new Set();
    }
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { language, t } = useLanguage();
  const isRtl = language === 'he';

  const activeCategory = searchParams.get('category') || '';
  const query = String(searchParams.get('q') || '').trim();
  const sortBy = ['price-low', 'price-high', 'name'].includes(searchParams.get('sort'))
    ? searchParams.get('sort')
    : 'featured';
  const viewMode = searchParams.get('view') === 'list' ? 'list' : 'grid';
  // React Router keeps the URLSearchParams object stable while updating its
  // contents, so these controlled-filter sets must be derived on every render.
  const selectedGenerations = new Set(searchParams.getAll('gen'));
  const selectedTubes = new Set(searchParams.getAll('tube'));
  const hero = categoryContent[activeCategory] || categoryContent.all;
  const catalogUrl = `${location.pathname}${location.search}`;

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await fetch('/api/products', { signal: controller.signal });
        if (!response.ok) throw new Error(`Products request failed: ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Products response was not an array');
        setProducts(data.filter((product) => product.isActive !== false));
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load catalog:', error);
          setLoadError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    try {
      localStorage.setItem('fyuri-favorites', JSON.stringify([...favorites]));
    } catch {
      // Favorites remain usable for the session when storage is unavailable.
    }
  }, [favorites]);

  const updateSearchParams = (mutate) => {
    const next = new URLSearchParams(searchParams);
    mutate(next);
    setSearchParams(next);
  };

  const selectCategory = (value) => {
    updateSearchParams((next) => {
      if (value) next.set('category', value);
      else next.delete('category');
    });
    setMobileFiltersOpen(false);
  };

  const toggleArrayParam = (name, value) => {
    updateSearchParams((next) => {
      const values = next.getAll(name);
      next.delete(name);
      const updated = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];
      updated.forEach((item) => next.append(name, item));
    });
  };

  const toggleFavorite = (id) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(categoryOrder.map((category) => [category, 0]));
    products.forEach((product) => {
      if (Object.hasOwn(counts, product.productType)) counts[product.productType] += 1;
    });
    return counts;
  }, [products]);

  const categoryProducts = useMemo(() => (
    activeCategory
      ? products.filter((product) => product.productType === activeCategory)
      : products
  ), [activeCategory, products]);

  const searchedProducts = useMemo(() => {
    if (!query) return categoryProducts;
    const needle = query.toLocaleLowerCase(language === 'he' ? 'he' : 'en');
    return categoryProducts.filter((product) => {
      const haystack = [
        product.name,
        product.nameHebrew,
        product.description,
        product.descriptionHebrew,
        product.productType,
        ...Object.values(product.specifications || {}),
      ].join(' ').toLocaleLowerCase(language === 'he' ? 'he' : 'en');
      return haystack.includes(needle);
    });
  }, [categoryProducts, language, query]);

  const generationCounts = useMemo(() => {
    const counts = Object.fromEntries(generationOptions.map((option) => [option.key, 0]));
    searchedProducts.forEach((product) => {
      const key = normalizeGeneration(product.generation);
      if (Object.hasOwn(counts, key)) counts[key] += 1;
    });
    return counts;
  }, [searchedProducts]);

  const tubeCounts = useMemo(() => {
    const counts = Object.fromEntries(tubeOptions.map((option) => [option.key, 0]));
    searchedProducts.forEach((product) => {
      const normalized = normalizeTube(product.tubeType);
      const option = tubeOptions.find((candidate) => candidate.value === normalized);
      if (option) counts[option.key] += 1;
    });
    return counts;
  }, [searchedProducts]);

  const filteredProducts = searchedProducts.filter((product) => {
    const generation = normalizeGeneration(product.generation);
    const tube = normalizeTube(product.tubeType);
    const generationMatches = selectedGenerations.size === 0
      || selectedGenerations.has(generation);
    const tubeMatches = selectedTubes.size === 0
      || tubeOptions.some(
        (option) => selectedTubes.has(option.key) && option.value === tube,
      );
    return generationMatches && tubeMatches;
  });

  const displayProducts = (() => {
    const sorted = [...filteredProducts];
    if (sortBy === 'price-low') {
      sorted.sort((left, right) => Number(left.price || 0) - Number(right.price || 0));
    } else if (sortBy === 'price-high') {
      sorted.sort((left, right) => Number(right.price || 0) - Number(left.price || 0));
    } else if (sortBy === 'name') {
      sorted.sort((left, right) => localizedName(left, language).localeCompare(
        localizedName(right, language),
        language,
      ));
    }
    return sorted;
  })();

  const capabilities = [
    {
      icon: SettingsOutlined,
      title: t({ he: 'שפופרות נבדקות בנפרד', en: 'Individually Tested Tubes' }),
      detail: t({ he: 'כל מכשיר נבדק במעבדה', en: 'Every device tested in-house' }),
    },
    {
      icon: ScienceOutlined,
      title: t({ he: 'שירותי מעבדה זמינים', en: 'Lab Services Available' }),
      detail: t({ he: 'תחזוקה, תיקונים ושדרוגים', en: 'Maintenance, repairs, upgrades' }),
    },
    {
      icon: ShieldOutlined,
      title: t({ he: 'אחריות לשנתיים', en: '2 Year Warranty' }),
      detail: t({ he: 'בנוי להחזיק מעמד', en: 'Built to last. We stand behind it.' }),
    },
    {
      icon: HeadsetMicOutlined,
      title: t({ he: 'תמיכת מומחים', en: 'Expert Support' }),
      detail: t({ he: 'אנשים אמיתיים. מומחיות אמיתית.', en: 'Real people. Real expertise.' }),
    },
    {
      icon: TuneOutlined,
      title: t({ he: 'אפשרויות בנייה מותאמות', en: 'Custom Build Options' }),
      detail: t({ he: 'התאמה מדויקת למשימה', en: 'Configure to your mission' }),
    },
  ];

  const resultSummary = t({
    he: `מציג ${displayProducts.length} מתוך ${categoryProducts.length} תוצאות`,
    en: `Showing ${displayProducts.length} of ${categoryProducts.length} results`,
  });

  return (
    <div className="reference-products-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="reference-catalog-hero" aria-labelledby="reference-catalog-title">
        <img
          className="reference-catalog-hero__image"
          src="/images/catalog/catalog-monocular-hero-v2.webp"
          alt=""
          width="1969"
          height="799"
          fetchPriority="high"
        />
        <div className="reference-catalog-hero__shade" aria-hidden="true" />
        <div className="reference-catalog-hero__copy">
          <nav
            aria-label={t({ he: 'פירורי לחם', en: 'Breadcrumb' })}
            className="reference-breadcrumb"
          >
            <RouterLink to="/">{t({ he: 'בית', en: 'Home' })}</RouterLink>
            {isRtl ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            <RouterLink to="/products">{t({ he: 'מוצרים', en: 'Products' })}</RouterLink>
            {isRtl ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            <span aria-current="page">{t(hero.category)}</span>
          </nav>
          <h1 id="reference-catalog-title">{t(hero.title)}</h1>
          <p className="reference-catalog-hero__tagline">{t(hero.tagline)}</p>
          <p className="reference-catalog-hero__description">{t(hero.description)}</p>
        </div>
      </section>

      <section
        className="reference-capabilities"
        aria-label={t({ he: 'התחייבויות שירות', en: 'Service commitments' })}
      >
        <ul>
          {capabilities.map(({ detail, icon: CapabilityIcon, title }) => (
            <li key={title}>
              <CapabilityIcon aria-hidden="true" />
              <div>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="reference-catalog-results">
        <aside
          className="reference-catalog-sidebar"
          aria-label={t({ he: 'מסנני קטלוג', en: 'Catalog filters' })}
        >
          <FilterPanel
            activeCategory={activeCategory}
            categoryCounts={categoryCounts}
            generationCounts={generationCounts}
            onCategoryChange={selectCategory}
            onGenerationToggle={(value) => toggleArrayParam('gen', value)}
            onTubeToggle={(value) => toggleArrayParam('tube', value)}
            selectedGenerations={selectedGenerations}
            selectedTubes={selectedTubes}
            setTubeQualityOpen={setTubeQualityOpen}
            t={t}
            tubeCounts={tubeCounts}
            tubeQualityOpen={tubeQualityOpen}
          />
        </aside>

        <div className="reference-catalog-main">
          <div className="reference-catalog-toolbar">
            <button
              type="button"
              className="reference-mobile-filter"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <FilterList aria-hidden="true" />
              {t({ he: 'סינון', en: 'FILTERS' })}
            </button>

            <div className="reference-catalog-summary" aria-live="polite">
              <span>{resultSummary}</span>
              {query && (
                <button
                  type="button"
                  className="reference-clear-search"
                  onClick={() => updateSearchParams((next) => next.delete('q'))}
                  aria-label={t({ he: 'ניקוי חיפוש', en: 'Clear search' })}
                >
                  “{query}” <Close aria-hidden="true" />
                </button>
              )}
            </div>

            <label className="reference-catalog-sort">
              <span>{t({ he: 'מיון:', en: 'Sort by:' })}</span>
              <select
                value={sortBy}
                aria-label={t({ he: 'מיון לפי', en: 'Sort by' })}
                onChange={(event) => updateSearchParams((next) => {
                  if (event.target.value === 'featured') next.delete('sort');
                  else next.set('sort', event.target.value);
                })}
              >
                <option value="featured">{t({ he: 'מומלצים', en: 'Featured' })}</option>
                <option value="price-low">{t({ he: 'מחיר: נמוך לגבוה', en: 'Price: Low to high' })}</option>
                <option value="price-high">{t({ he: 'מחיר: גבוה לנמוך', en: 'Price: High to low' })}</option>
                <option value="name">{t({ he: 'שם', en: 'Name' })}</option>
              </select>
            </label>

            <div
              className="reference-view-toggle"
              role="group"
              aria-label={t({ he: 'תצוגת מוצרים', en: 'Product view' })}
            >
              <button
                type="button"
                className={viewMode === 'grid' ? 'is-active' : undefined}
                aria-label={t({ he: 'תצוגת רשת', en: 'Grid view' })}
                aria-pressed={viewMode === 'grid'}
                onClick={() => updateSearchParams((next) => next.delete('view'))}
              >
                <GridView aria-hidden="true" />
              </button>
              <button
                type="button"
                className={viewMode === 'list' ? 'is-active' : undefined}
                aria-label={t({ he: 'תצוגת רשימה', en: 'List view' })}
                aria-pressed={viewMode === 'list'}
                onClick={() => updateSearchParams((next) => next.set('view', 'list'))}
              >
                <ListIcon aria-hidden="true" />
              </button>
            </div>
          </div>

          {loading && (
            <div className="reference-catalog-state" role="status">
              <CircularProgress size={34} />
              <span>{t({ he: 'טוען קטלוג...', en: 'Loading catalog…' })}</span>
            </div>
          )}

          {!loading && loadError && (
            <div className="reference-catalog-state reference-catalog-state--error" role="alert">
              <strong>{t({ he: 'הקטלוג לא נטען', en: 'The catalog could not be loaded' })}</strong>
              <span>{t({ he: 'בדקו את החיבור ונסו שוב.', en: 'Check the connection and try again.' })}</span>
              <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
                {t({ he: 'ניסיון נוסף', en: 'TRY AGAIN' })}
              </button>
            </div>
          )}

          {!loading && !loadError && displayProducts.length === 0 && (
            <div className="reference-catalog-state reference-catalog-state--empty">
              <VisibilityOutlined aria-hidden="true" />
              <strong>{t({ he: 'לא נמצאו מוצרים מתאימים', en: 'No matching products found' })}</strong>
              <span>{t({ he: 'שנו את המסננים או נקו את החיפוש.', en: 'Adjust the filters or clear the search.' })}</span>
              <button
                type="button"
                onClick={() => setSearchParams(activeCategory ? { category: activeCategory } : {})}
              >
                {t({ he: 'ניקוי מסננים', en: 'CLEAR FILTERS' })}
              </button>
            </div>
          )}

          {!loading && !loadError && displayProducts.length > 0 && (
            <div
              className={`reference-product-grid reference-product-grid--${viewMode}`}
              role="list"
              aria-label={t({ he: 'מוצרי קטלוג', en: 'Catalog products' })}
            >
              {displayProducts.map((product) => (
                <ProductCard
                  catalogUrl={catalogUrl}
                  favorite={favorites.has(product.id)}
                  key={product.id}
                  language={language}
                  onFavorite={() => toggleFavorite(product.id)}
                  product={product}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Drawer
        anchor={isRtl ? 'right' : 'left'}
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{
          className: 'reference-filter-drawer',
          id: 'reference-filter-drawer',
        }}
      >
        <FilterPanel
          activeCategory={activeCategory}
          categoryCounts={categoryCounts}
          generationCounts={generationCounts}
          onCategoryChange={selectCategory}
          onClose={() => setMobileFiltersOpen(false)}
          onGenerationToggle={(value) => toggleArrayParam('gen', value)}
          onTubeToggle={(value) => toggleArrayParam('tube', value)}
          selectedGenerations={selectedGenerations}
          selectedTubes={selectedTubes}
          setTubeQualityOpen={setTubeQualityOpen}
          t={t}
          tubeCounts={tubeCounts}
          tubeQualityOpen={tubeQualityOpen}
        />
      </Drawer>
    </div>
  );
}

export default ProductsPage;
