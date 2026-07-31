import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Drawer,
  FormControlLabel,
  FormGroup,
  IconButton,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  AddShoppingCart,
  AllInclusive,
  Build,
  CategoryOutlined,
  ChevronLeft,
  ChevronRight,
  Close,
  ExpandLess,
  ExpandMore,
  Favorite,
  FavoriteBorder,
  FilterList,
  GridView,
  HandymanOutlined,
  HeadsetMicOutlined,
  Inventory2Outlined,
  List as ListIcon,
  RestartAlt,
  ShieldOutlined,
  TuneOutlined,
  VerifiedOutlined,
} from '@mui/icons-material';
import {
  Link as RouterLink,
  useLocation,
  useSearchParams,
} from 'react-router';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useThemeMode } from '../context/ThemeContext';
import { productCategories } from '../components/navigationConfig';
import { formatGeneration } from '../utils/generationUtils';
import { resolveAssetUrl } from '../apiConfig';
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

const generationOptions = [
  { key: '1', value: '1', label: 'Gen 1' },
  { key: '2', value: '2', label: 'Gen 2' },
  { key: '2-plus', value: '2+', label: 'Gen 2+' },
  { key: '3', value: '3', label: 'Gen 3' },
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

const lightBackgroundImageFiles = [
  'apnvg.jpg',
  'bnvd-1431.jpg',
  'chimera.png',
  'clip-ch50.jpg',
  'dtnvs.jpg',
  'gpnvg-18.jpg',
  'intensifier-tube.jpg',
  'ir-940.png',
  'rico-micro.jpg',
  'rico-mk1.jpg',
  'rpo-lens.jpg',
];

const categoryContent = {
  all: {
    title: { he: 'מערכות ראיית לילה', en: 'Night vision systems' },
    eyebrow: { he: 'FYURI / קטלוג מערכות', en: 'FYURI / SYSTEMS CATALOG' },
    tagline: {
      he: 'נבנה לבהירות. מותאם למשימה.',
      en: 'Built for clarity. Configured for the mission.',
    },
    description: {
      he: 'מערכות, רכיבים ואופטיקה מקצועית — ממכשיר שלם ועד בנייה מותאמת אישית.',
      en: 'Professional systems, components and optics—from a complete device to a mission-specific build.',
    },
  },
  monocular: {
    title: { he: 'חד עיניים', en: 'Monoculars' },
    eyebrow: { he: 'FYURI / ראיית לילה', en: 'FYURI / NIGHT SYSTEMS' },
    tagline: {
      he: 'קומפקטי. מסוגל. מוכן למשימה.',
      en: 'Compact. Capable. Mission ready.',
    },
    description: {
      he: 'מכשירי ראיית לילה חד עיניים מקצועיים לבהירות, אמינות וביצועים בשטח.',
      en: 'Professional-grade night vision monoculars built for clarity, reliability and real-world performance.',
    },
  },
  binocular: {
    title: { he: 'דו עיניים', en: 'Binoculars' },
    eyebrow: { he: 'FYURI / ראיית לילה', en: 'FYURI / NIGHT SYSTEMS' },
    tagline: {
      he: 'עומק, איזון וביצועים לאורך כל הלילה.',
      en: 'Depth, balance and all-night performance.',
    },
    description: {
      he: 'מערכות דו עיניות מקצועיות עם ארגונומיה מדויקת וביצועים מוכחים בתנאי אור נמוך.',
      en: 'Professional dual-tube systems with balanced ergonomics and proven low-light performance.',
    },
  },
  panoramic: {
    title: { he: 'מערכות פנורמיות', en: 'Panoramic systems' },
    eyebrow: { he: 'FYURI / שדה ראייה רחב', en: 'FYURI / WIDE FIELD SYSTEMS' },
    tagline: {
      he: 'מודעות היקפית ללא פשרות.',
      en: 'Uncompromised situational awareness.',
    },
    description: {
      he: 'מערכות ארבע-עיניות ושדה ראייה רחב למשימות שבהן כל פרט בקצה התמונה חשוב.',
      en: 'Four-channel and wide-field systems for missions where peripheral detail matters.',
    },
  },
  intensifier: {
    title: { he: 'מגברי אור', en: 'Image intensifiers' },
    eyebrow: { he: 'FYURI / לב המערכת', en: 'FYURI / SYSTEM CORE' },
    tagline: {
      he: 'איכות התמונה מתחילה בשפופרת.',
      en: 'Image quality starts at the tube.',
    },
    description: {
      he: 'מגברי אור מדור 2+ ודור 3, בזרחן לבן או ירוק וברמות ביצועים שונות.',
      en: 'Gen 2+ and Gen 3 intensifier tubes in white or green phosphor across multiple performance tiers.',
    },
  },
  optics: {
    title: { he: 'עדשות ואופטיקה', en: 'Lenses & optics' },
    eyebrow: { he: 'FYURI / נתיב אופטי', en: 'FYURI / OPTICAL PATH' },
    tagline: {
      he: 'בהירות מקצה לקצה.',
      en: 'Clarity from edge to edge.',
    },
    description: {
      he: 'עדשות קדמיות, עיניות ומגדילים שנבחרו לבנייה, שדרוג ותחזוקת מערכות.',
      en: 'Objectives, eyepieces and magnifiers selected for system builds, upgrades and maintenance.',
    },
  },
  thermal: {
    title: { he: 'מערכות תרמיות', en: 'Thermal systems' },
    eyebrow: { he: 'FYURI / גילוי תרמי', en: 'FYURI / THERMAL DETECTION' },
    tagline: {
      he: 'לזהות את מה שהחושך לא מסתיר.',
      en: 'Detect what darkness cannot hide.',
    },
    description: {
      he: 'מונוקולרים, כוונות וקליפ-אונים תרמיים לתצפית, פיוז׳ן ושילוב עם אופטיקת יום.',
      en: 'Thermal monoculars, sights and clip-ons for observation, fusion and day-optic integration.',
    },
  },
  housing: {
    title: { he: 'גופים', en: 'Housings' },
    eyebrow: { he: 'FYURI / בסיס המערכת', en: 'FYURI / SYSTEM PLATFORM' },
    tagline: {
      he: 'הפלטפורמה הנכונה לבנייה מדויקת.',
      en: 'The right platform for a precise build.',
    },
    description: {
      he: 'גופים לחד עיני, דו עיני ופנורמי — כולל אפשרויות חומר ותצורה לבנייה מותאמת.',
      en: 'Monocular, binocular and panoramic housings with material and configuration options.',
    },
  },
  accessories: {
    title: { he: 'אביזרים', en: 'Accessories' },
    eyebrow: { he: 'FYURI / השלמת המערכת', en: 'FYURI / COMPLETE THE SYSTEM' },
    tagline: {
      he: 'כל מה שמחבר את המערכת למשימה.',
      en: 'Everything that connects the system to the mission.',
    },
    description: {
      he: 'מתאמי קסדה, סוללות, מאירים וחלקים משלימים למערכת שלמה ומוכנה לשטח.',
      en: 'Helmet mounts, power, illuminators and supporting components for a field-ready system.',
    },
  },
};

const normalizeGeneration = (value) => {
  if (!value) return '';
  const match = String(value)
    .toLowerCase()
    .replace(/gen\s*/, '')
    .match(/^\s*([0-9]\+?)/);
  return match ? match[1] : '';
};

const normalizeTubeType = (value) => String(value || '').trim().toLowerCase();

const imageQualityScore = (product) => {
  const image = String(product.thumbnailUrl || product.imageUrls?.[0] || '');
  if (!image) return 0;
  if (image.includes('/products/chimera')) return 5;
  if (image.includes('/products/')) return 4;
  if (image.includes('/banners/')) return 1;
  return 2;
};

const collapseVariantGroups = (products) => {
  const singles = [];
  const groups = new Map();

  products.forEach((product, index) => {
    const groupId = product.specifications?.VariantGroup;

    if (!groupId) {
      singles.push({
        ...product,
        _catalogIndex: index,
        _startingPrice: Number(product.price || 0),
        _variantCount: 1,
        _grouped: false,
      });
      return;
    }

    if (!groups.has(groupId)) {
      groups.set(groupId, { firstIndex: index, products: [] });
    }
    groups.get(groupId).products.push(product);
  });

  const grouped = Array.from(groups.values()).map(({ firstIndex, products: variants }) => {
    const stableVariants = [...variants].sort((left, right) => (
      Number(left.price || 0) - Number(right.price || 0)
      || Number(left.id || 0) - Number(right.id || 0)
    ));
    const representative = [...stableVariants].sort((left, right) => (
      imageQualityScore(right) - imageQualityScore(left)
      || Number(left.id || 0) - Number(right.id || 0)
    ))[0];
    const inStockVariants = stableVariants.filter((variant) => variant.inStock);
    const purchasableVariants = inStockVariants.length > 0 ? inStockVariants : stableVariants;
    const startingPrice = Number(purchasableVariants[0]?.price || 0);

    return {
      ...representative,
      inStock: inStockVariants.length > 0,
      stockQuantity: inStockVariants.reduce(
        (total, variant) => total + Number(variant.stockQuantity || 0),
        0,
      ),
      _catalogIndex: firstIndex,
      _startingPrice: startingPrice,
      _variantCount: stableVariants.length,
      _grouped: stableVariants.length > 1,
    };
  });

  return [...singles, ...grouped].sort((left, right) => (
    left._catalogIndex - right._catalogIndex
  ));
};

const localizedProductName = (product, language) => (
  language === 'he'
    ? (product.nameHebrew || product.name || '')
    : (product.name || product.nameHebrew || '')
);

const localizedProductDescription = (product, language) => (
  language === 'he'
    ? (product.descriptionHebrew || product.description || '')
    : (product.description || product.descriptionHebrew || '')
);

function FilterDisclosure({
  children,
  contentId,
  open,
  onToggle,
  title,
}) {
  return (
    <section className="catalog-filter-section">
      <button
        type="button"
        className="catalog-filter-section__toggle"
        aria-controls={contentId}
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>{title}</span>
        {open ? <ExpandLess aria-hidden="true" /> : <ExpandMore aria-hidden="true" />}
      </button>
      <Collapse in={open} timeout={180}>
        <div id={contentId} className="catalog-filter-section__content">
          {children}
        </div>
      </Collapse>
    </section>
  );
}

function ProductImage({ eager, name, product }) {
  const [failed, setFailed] = useState(false);
  const source = resolveAssetUrl(product.thumbnailUrl || product.imageUrls?.[0]);
  const needsDarkMatte = lightBackgroundImageFiles.some(
    (fileName) => String(source || '').toLowerCase().endsWith(`/${fileName}`),
  );

  if (!source || failed) {
    return (
      <div className="catalog-card__image-fallback" role="img" aria-label={name}>
        <AllInclusive aria-hidden="true" />
        <span>FYURI</span>
      </div>
    );
  }

  return (
    <img
      className={`catalog-card__image ${needsDarkMatte ? 'catalog-card__image--light-source' : ''}`}
      src={source}
      alt={name}
      width="640"
      height="420"
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      onError={() => setFailed(true)}
    />
  );
}

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [generationsOpen, setGenerationsOpen] = useState(true);
  const [tubeTypesOpen, setTubeTypesOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [pendingProductIds, setPendingProductIds] = useState(() => new Set());
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('fyuri-favorites') || '[]'));
    } catch {
      return new Set();
    }
  });

  const { addToCart } = useCart();
  const { language, t } = useLanguage();
  const { mode } = useThemeMode();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const currentCategory = searchParams.get('category') || '';
  const selectedGenerationKeys = searchParams.getAll('gen');
  const selectedTubeKeys = searchParams.getAll('tube');
  const inStockOnly = searchParams.get('stock') === 'in';
  const sortBy = ['price-asc', 'price-desc', 'name'].includes(searchParams.get('sort'))
    ? searchParams.get('sort')
    : 'default';
  const viewMode = searchParams.get('view') === 'list' ? 'list' : 'grid';
  const currentHero = categoryContent[currentCategory] || categoryContent.all;
  const isRtl = language === 'he';
  const catalogUrl = `${location.pathname}${location.search}`;

  const selectedGenerations = selectedGenerationKeys
    .map((key) => generationOptions.find((option) => option.key === key)?.value)
    .filter(Boolean);
  const selectedTubeTypes = selectedTubeKeys
    .map((key) => tubeOptions.find((option) => option.key === key)?.value)
    .filter(Boolean);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/products', { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Products request failed with ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Products response was not a list');
        }

        setProducts(data);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          console.error('Failed to fetch products:', requestError);
          setError(t({
            he: 'לא הצלחנו לטעון את הקטלוג. בדקו את החיבור ונסו שוב.',
            en: 'We could not load the catalog. Check the connection and try again.',
          }));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, [reloadKey, t]);

  useEffect(() => {
    localStorage.setItem('fyuri-favorites', JSON.stringify(Array.from(favoriteIds)));
  }, [favoriteIds]);

  const categoryItems = useMemo(() => categoryOrder
    .map((categoryValue) => productCategories.find(
      (category) => category.value === categoryValue,
    ))
    .filter(Boolean), []);

  const groupedCatalog = useMemo(
    () => collapseVariantGroups(products),
    [products],
  );

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(categoryOrder.map((category) => [category, 0]));
    groupedCatalog.forEach((product) => {
      if (Object.hasOwn(counts, product.productType)) {
        counts[product.productType] += 1;
      }
    });
    return counts;
  }, [groupedCatalog]);

  const categoryProducts = useMemo(() => (
    currentCategory
      ? groupedCatalog.filter((product) => product.productType === currentCategory)
      : groupedCatalog
  ), [currentCategory, groupedCatalog]);

  const generationCounts = useMemo(() => {
    const counts = Object.fromEntries(generationOptions.map(({ value }) => [value, 0]));
    categoryProducts.forEach((product) => {
      const generation = normalizeGeneration(product.generation);
      if (Object.hasOwn(counts, generation)) {
        counts[generation] += 1;
      }
    });
    return counts;
  }, [categoryProducts]);

  const tubeCounts = useMemo(() => {
    const counts = Object.fromEntries(tubeOptions.map(({ value }) => [value, 0]));
    categoryProducts.forEach((product) => {
      const tubeType = normalizeTubeType(product.tubeType);
      if (Object.hasOwn(counts, tubeType)) {
        counts[tubeType] += 1;
      }
    });
    return counts;
  }, [categoryProducts]);

  const filteredProducts = categoryProducts.filter((product) => {
    const generationMatches = selectedGenerations.length === 0
      || selectedGenerations.includes(normalizeGeneration(product.generation));
    const tubeMatches = selectedTubeTypes.length === 0
      || selectedTubeTypes.includes(normalizeTubeType(product.tubeType));
    const stockMatches = !inStockOnly || product.inStock;
    return generationMatches && tubeMatches && stockMatches;
  });

  const displayProducts = [...filteredProducts].sort((left, right) => {
    if (sortBy === 'price-asc') {
      return left._startingPrice - right._startingPrice || left.id - right.id;
    }
    if (sortBy === 'price-desc') {
      return right._startingPrice - left._startingPrice || left.id - right.id;
    }
    if (sortBy === 'name') {
      return localizedProductName(left, language).localeCompare(
        localizedProductName(right, language),
        language === 'he' ? 'he' : 'en',
      );
    }
    return left.id - right.id;
  });

  const formatPrice = useMemo(() => new Intl.NumberFormat(
    language === 'he' ? 'he-IL' : 'en-IL',
    {
      style: 'currency',
      currency: 'ILS',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
    },
  ), [language]);

  const activeFilterCount = (
    selectedGenerationKeys.length
    + selectedTubeKeys.length
    + (inStockOnly ? 1 : 0)
  );

  const updateParams = (mutate, options = {}) => {
    const next = new URLSearchParams(searchParams);
    mutate(next);
    setSearchParams(next, options);
  };

  const selectCategory = (categoryValue) => {
    updateParams((next) => {
      if (categoryValue) {
        next.set('category', categoryValue);
      } else {
        next.delete('category');
      }
    });
    setMobileOpen(false);
  };

  const toggleMultiParam = (name, value) => {
    updateParams((next) => {
      const values = next.getAll(name);
      next.delete(name);
      const updated = values.includes(value)
        ? values.filter((current) => current !== value)
        : [...values, value];
      updated.forEach((item) => next.append(name, item));
    });
  };

  const clearFacetFilters = () => {
    updateParams((next) => {
      next.delete('gen');
      next.delete('tube');
      next.delete('stock');
    });
  };

  const handleAddToCart = async (product) => {
    if (pendingProductIds.has(product.id)) return;

    setPendingProductIds((current) => new Set(current).add(product.id));
    try {
      await addToCart(product);
    } finally {
      setPendingProductIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
    }
  };

  const toggleFavorite = (productId) => {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const capabilities = [
    {
      icon: VerifiedOutlined,
      title: t({ he: 'קטלוג מערכות מלא', en: 'Complete systems catalog' }),
      detail: t({ he: 'מכשירים, אופטיקה ורכיבים', en: 'Devices, optics and components' }),
    },
    {
      icon: HandymanOutlined,
      title: t({ he: 'שירותי מעבדה', en: 'Lab services available' }),
      detail: t({ he: 'תחזוקה, תיקונים ושדרוגים', en: 'Maintenance, repairs and upgrades' }),
    },
    {
      icon: TuneOutlined,
      title: t({ he: 'הכוונת תצורה', en: 'Configuration guidance' }),
      detail: t({ he: 'התאמת המערכת לצורך', en: 'Match the system to the mission' }),
    },
    {
      icon: HeadsetMicOutlined,
      title: t({ he: 'קשר ישיר', en: 'Direct specialist contact' }),
      detail: t({ he: 'מענה אנושי ומקצועי', en: 'Real people, practical expertise' }),
    },
    {
      icon: Build,
      title: t({ he: 'אפשרויות בנייה', en: 'Flexible build options' }),
      detail: t({ he: 'מערכת שלמה או רכיבים', en: 'Complete systems or individual parts' }),
    },
  ];

  const renderFilters = (mobile = false) => (
    <div className="catalog-filter-panel">
      <div className="catalog-filter-panel__header">
        <div>
          <span className="catalog-kicker">
            {t({ he: 'סינון', en: 'FILTERS' })}
          </span>
          {activeFilterCount > 0 && (
            <span className="catalog-filter-count">{activeFilterCount}</span>
          )}
        </div>
        <div className="catalog-filter-panel__header-actions">
          {activeFilterCount > 0 && (
            <Tooltip title={t({ he: 'נקה מסננים', en: 'Clear filters' })}>
              <IconButton
                size="small"
                onClick={clearFacetFilters}
                aria-label={t({ he: 'נקה מסננים', en: 'Clear filters' })}
              >
                <RestartAlt />
              </IconButton>
            </Tooltip>
          )}
          {mobile && (
            <IconButton
              data-testid="catalog-filter-close"
              onClick={() => setMobileOpen(false)}
              aria-label={t({ he: 'סגור מסננים', en: 'Close filters' })}
            >
              <Close />
            </IconButton>
          )}
        </div>
      </div>

      <FilterDisclosure
        title={t({ he: 'קטגוריות', en: 'Categories' })}
        contentId={mobile ? 'mobile-category-filters' : 'desktop-category-filters'}
        open={categoriesOpen}
        onToggle={() => setCategoriesOpen((current) => !current)}
      >
        <div className="catalog-category-list" role="list">
          <button
            type="button"
            className={`catalog-category-row ${!currentCategory ? 'is-active' : ''}`}
            onClick={() => selectCategory('')}
            aria-current={!currentCategory ? 'page' : undefined}
          >
            <CategoryOutlined aria-hidden="true" />
            <span>{t({ he: 'כל המוצרים', en: 'All products' })}</span>
            <span className="catalog-category-row__count">{groupedCatalog.length}</span>
          </button>
          {categoryItems.map((category) => {
            const CategoryIcon = category.icon;
            const isActive = currentCategory === category.value;
            return (
              <button
                type="button"
                key={category.value}
                className={`catalog-category-row ${isActive ? 'is-active' : ''}`}
                onClick={() => selectCategory(category.value)}
                aria-current={isActive ? 'page' : undefined}
              >
                <CategoryIcon aria-hidden="true" />
                <span>{category.label[language] || category.label.en}</span>
                <span className="catalog-category-row__count">
                  {categoryCounts[category.value] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </FilterDisclosure>

      <FilterDisclosure
        title={t({ he: 'דור', en: 'Generation' })}
        contentId={mobile ? 'mobile-generation-filters' : 'desktop-generation-filters'}
        open={generationsOpen}
        onToggle={() => setGenerationsOpen((current) => !current)}
      >
        <FormGroup className="catalog-checkbox-group">
          {generationOptions.map((option) => {
            const count = generationCounts[option.value] || 0;
            return (
              <FormControlLabel
                key={option.key}
                disabled={count === 0 && !selectedGenerationKeys.includes(option.key)}
                control={(
                  <Checkbox
                    checked={selectedGenerationKeys.includes(option.key)}
                    onChange={() => toggleMultiParam('gen', option.key)}
                    size="small"
                  />
                )}
                label={(
                  <span className="catalog-checkbox-label">
                    <span>{option.label}</span>
                    <span>{count}</span>
                  </span>
                )}
              />
            );
          })}
        </FormGroup>
      </FilterDisclosure>

      <FilterDisclosure
        title={t({ he: 'סוג שפופרת', en: 'Tube type' })}
        contentId={mobile ? 'mobile-tube-filters' : 'desktop-tube-filters'}
        open={tubeTypesOpen}
        onToggle={() => setTubeTypesOpen((current) => !current)}
      >
        <FormGroup className="catalog-checkbox-group">
          {tubeOptions.map((option) => {
            const count = tubeCounts[option.value] || 0;
            return (
              <FormControlLabel
                key={option.key}
                disabled={count === 0 && !selectedTubeKeys.includes(option.key)}
                control={(
                  <Checkbox
                    checked={selectedTubeKeys.includes(option.key)}
                    onChange={() => toggleMultiParam('tube', option.key)}
                    size="small"
                  />
                )}
                label={(
                  <span className="catalog-checkbox-label">
                    <span>{option.label[language] || option.label.en}</span>
                    <span>{count}</span>
                  </span>
                )}
              />
            );
          })}
        </FormGroup>
      </FilterDisclosure>

      <FilterDisclosure
        title={t({ he: 'זמינות', en: 'Availability' })}
        contentId={mobile ? 'mobile-stock-filters' : 'desktop-stock-filters'}
        open={availabilityOpen}
        onToggle={() => setAvailabilityOpen((current) => !current)}
      >
        <FormGroup className="catalog-checkbox-group">
          <FormControlLabel
            control={(
              <Checkbox
                checked={inStockOnly}
                onChange={() => updateParams((next) => {
                  if (inStockOnly) next.delete('stock');
                  else next.set('stock', 'in');
                })}
                size="small"
              />
            )}
            label={(
              <span className="catalog-checkbox-label">
                <span>{t({ he: 'במלאי', en: 'In stock' })}</span>
                <span>{categoryProducts.filter((product) => product.inStock).length}</span>
              </span>
            )}
          />
        </FormGroup>
      </FilterDisclosure>

      <div className="catalog-filter-panel__builder">
        <span className="catalog-kicker">
          {t({ he: 'צריכים תצורה מלאה?', en: 'NEED A COMPLETE SETUP?' })}
        </span>
        <p>
          {t({
            he: 'בנו מערכת לפי סוג, מגבר אור, אופטיקה והרכבה.',
            en: 'Configure the device, tubes, optics and supporting hardware.',
          })}
        </p>
        <Button
          component={RouterLink}
          to="/builder"
          startIcon={<Build />}
          variant="outlined"
          fullWidth
        >
          {t({ he: 'בנו את המכשיר', en: 'Build your device' })}
        </Button>
      </div>
    </div>
  );

  return (
    <Box
      component="section"
      className={`catalog-page catalog-page--${mode}`}
      aria-labelledby="catalog-title"
    >
      <section className="catalog-hero">
        <img
          className="catalog-hero__image"
          src="/images/banners/catalog-night-ops.webp"
          alt=""
          width="1798"
          height="875"
          loading="eager"
          fetchPriority="high"
        />
        <div className="catalog-hero__scrim" aria-hidden="true" />
        <div className="catalog-wide-inner catalog-hero__inner">
          <nav
            className="catalog-breadcrumb"
            aria-label={t({ he: 'פירורי לחם', en: 'Breadcrumb' })}
          >
            <RouterLink to="/">{t({ he: 'בית', en: 'Home' })}</RouterLink>
            {isRtl ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            <RouterLink to="/products">{t({ he: 'מוצרים', en: 'Products' })}</RouterLink>
            {currentCategory && (
              <>
                {isRtl ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                <span aria-current="page">{currentHero.title[language]}</span>
              </>
            )}
          </nav>
          <div className="catalog-hero__copy">
            <span className="catalog-kicker catalog-hero__kicker">
              {currentHero.eyebrow[language]}
            </span>
            <h1 id="catalog-title" dir="auto">
              {currentHero.title[language]}
            </h1>
            <p className="catalog-hero__tagline">
              {currentHero.tagline[language]}
            </p>
            <p className="catalog-hero__description">
              {currentHero.description[language]}
            </p>
          </div>
        </div>
      </section>

      <section
        className="catalog-capabilities"
        aria-label={t({ he: 'יכולות ושירותים', en: 'Capabilities and services' })}
      >
        <ul className="catalog-wide-inner catalog-capabilities__list">
          {capabilities.map(({ icon: CapabilityIcon, title, detail }) => (
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

      <section className="catalog-results">
        <div className="catalog-wide-inner catalog-results__inner">
          <aside
            className="catalog-sidebar"
            aria-label={t({ he: 'סינון קטלוג', en: 'Catalog filters' })}
          >
            {renderFilters()}
          </aside>

          <div className="catalog-results__main" aria-busy={loading}>
            <div className="catalog-toolbar">
              <Button
                data-testid="catalog-filter-open"
                className="catalog-toolbar__filter-button"
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setMobileOpen(true)}
                aria-controls="catalog-mobile-filters"
                aria-expanded={mobileOpen}
              >
                {t({ he: 'מסננים', en: 'Filters' })}
                {activeFilterCount > 0 && (
                  <span className="catalog-filter-count">{activeFilterCount}</span>
                )}
              </Button>

              <div className="catalog-toolbar__summary" aria-live="polite">
                <Inventory2Outlined aria-hidden="true" />
                {loading
                  ? t({ he: 'טוען מוצרים…', en: 'Loading products…' })
                  : error
                    ? t({ he: 'הקטלוג אינו זמין כרגע', en: 'Catalog temporarily unavailable' })
                    : t({
                      he: `מציג ${displayProducts.length ? '1–' : ''}${displayProducts.length} מתוך ${displayProducts.length} תוצאות`,
                      en: `Showing ${displayProducts.length ? '1–' : ''}${displayProducts.length} of ${displayProducts.length} results`,
                    })}
              </div>

              <label className="catalog-sort">
                <span>{t({ he: 'מיון', en: 'Sort by' })}</span>
                <select
                  value={sortBy}
                  onChange={(event) => updateParams((next) => {
                    if (event.target.value === 'default') next.delete('sort');
                    else next.set('sort', event.target.value);
                  })}
                >
                  <option value="default">{t({ he: 'ברירת מחדל', en: 'Default' })}</option>
                  <option value="price-asc">{t({ he: 'מחיר: נמוך לגבוה', en: 'Price: Low to high' })}</option>
                  <option value="price-desc">{t({ he: 'מחיר: גבוה לנמוך', en: 'Price: High to low' })}</option>
                  <option value="name">{t({ he: 'שם', en: 'Name' })}</option>
                </select>
              </label>

              <div
                className="catalog-view-toggle"
                role="group"
                aria-label={t({ he: 'תצוגת מוצרים', en: 'Product view' })}
              >
                <Tooltip title={t({ he: 'תצוגת רשת', en: 'Grid view' })}>
                  <IconButton
                    aria-label={t({ he: 'תצוגת רשת', en: 'Grid view' })}
                    aria-pressed={viewMode === 'grid'}
                    onClick={() => updateParams((next) => next.delete('view'))}
                  >
                    <GridView />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t({ he: 'תצוגת רשימה', en: 'List view' })}>
                  <IconButton
                    aria-label={t({ he: 'תצוגת רשימה', en: 'List view' })}
                    aria-pressed={viewMode === 'list'}
                    onClick={() => updateParams((next) => next.set('view', 'list'))}
                  >
                    <ListIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="catalog-active-filters">
                <span>{t({ he: 'מסננים פעילים', en: 'Active filters' })}</span>
                {selectedGenerationKeys.map((key) => {
                  const option = generationOptions.find((item) => item.key === key);
                  if (!option) return null;
                  return (
                    <Chip
                      key={`gen-${key}`}
                      size="small"
                      label={option.label}
                      onDelete={() => toggleMultiParam('gen', key)}
                    />
                  );
                })}
                {selectedTubeKeys.map((key) => {
                  const option = tubeOptions.find((item) => item.key === key);
                  if (!option) return null;
                  return (
                    <Chip
                      key={`tube-${key}`}
                      size="small"
                      label={option.label[language] || option.label.en}
                      onDelete={() => toggleMultiParam('tube', key)}
                    />
                  );
                })}
                {inStockOnly && (
                  <Chip
                    size="small"
                    label={t({ he: 'במלאי', en: 'In stock' })}
                    onDelete={() => updateParams((next) => next.delete('stock'))}
                  />
                )}
                <Button size="small" onClick={clearFacetFilters}>
                  {t({ he: 'נקה הכל', en: 'Clear all' })}
                </Button>
              </div>
            )}

            {error && (
              <Alert
                severity="error"
                className="catalog-state"
                action={(
                  <Button color="inherit" size="small" onClick={() => setReloadKey((key) => key + 1)}>
                    {t({ he: 'נסו שוב', en: 'Retry' })}
                  </Button>
                )}
              >
                {error}
              </Alert>
            )}

            {!error && loading && (
              <div
                className={`catalog-product-grid catalog-product-grid--${viewMode}`}
                aria-hidden="true"
              >
                {Array.from({ length: 8 }, (_, index) => (
                  <div className="catalog-card catalog-card--skeleton" key={index}>
                    <Skeleton variant="rectangular" className="catalog-card__skeleton-image" />
                    <div className="catalog-card__body">
                      <Skeleton width="52%" height={30} />
                      <Skeleton width="92%" />
                      <Skeleton width="74%" />
                      <Skeleton width="42%" height={42} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!error && !loading && displayProducts.length === 0 && (
              <div className="catalog-empty catalog-state">
                <ShieldOutlined aria-hidden="true" />
                <span className="catalog-kicker">
                  {currentCategory === 'panoramic'
                    ? t({ he: 'קטגוריה בהכנה', en: 'CATEGORY IN PREPARATION' })
                    : t({ he: 'אין התאמות', en: 'NO MATCHES' })}
                </span>
                <h2>
                  {currentCategory === 'panoramic'
                    ? t({
                      he: 'המערכות הפנורמיות עדיין לא פורסמו בקטלוג.',
                      en: 'Panoramic systems have not been published in the catalog yet.',
                    })
                    : t({
                      he: 'לא נמצאו מוצרים שמתאימים למסננים האלה.',
                      en: 'No products match this filter combination.',
                    })}
                </h2>
                <p>
                  {currentCategory === 'panoramic'
                    ? t({
                      he: 'אפשר לדבר איתנו על בנייה פנורמית מותאמת או לבדוק גופים ורכיבים זמינים.',
                      en: 'Talk to us about a panoramic build, or explore available housings and components.',
                    })
                    : t({
                      he: 'נסו להסיר מסנן או לעבור לקטגוריה אחרת.',
                      en: 'Remove a filter or choose a different category.',
                    })}
                </p>
                <div className="catalog-empty__actions">
                  {activeFilterCount > 0 && (
                    <Button variant="outlined" onClick={clearFacetFilters}>
                      {t({ he: 'נקה מסננים', en: 'Clear filters' })}
                    </Button>
                  )}
                  <Button component={RouterLink} to="/contact" variant="contained">
                    {t({ he: 'דברו איתנו', en: 'Talk to us' })}
                  </Button>
                </div>
              </div>
            )}

            {!error && !loading && displayProducts.length > 0 && (
              <div
                className={`catalog-product-grid catalog-product-grid--${viewMode}`}
                role="list"
                aria-label={t({ he: 'מוצרי קטלוג', en: 'Catalog products' })}
              >
                {displayProducts.map((product, index) => {
                  const name = localizedProductName(product, language);
                  const description = localizedProductDescription(product, language);
                  const isFavorite = favoriteIds.has(product.id);
                  const isPending = pendingProductIds.has(product.id);
                  const lowStock = product.inStock && Number(product.stockQuantity || 0) <= 3;
                  const detailsUrl = `/products/${product.id}`;

                  return (
                    <article
                      className="catalog-card"
                      data-testid="catalog-product-card"
                      key={product.id}
                      role="listitem"
                    >
                      <div className="catalog-card__media">
                        <ProductImage
                          eager={viewMode === 'grid' && index < 4}
                          name={name}
                          product={product}
                        />
                        <Tooltip
                          title={isFavorite
                            ? t({ he: 'הסר מהמועדפים', en: 'Remove from favorites' })
                            : t({ he: 'שמור למועדפים', en: 'Save to favorites' })}
                        >
                          <IconButton
                            className="catalog-card__favorite"
                            aria-label={isFavorite
                              ? t({ he: `הסר את ${name} מהמועדפים`, en: `Remove ${name} from favorites` })
                              : t({ he: `שמור את ${name} למועדפים`, en: `Save ${name} to favorites` })}
                            aria-pressed={isFavorite}
                            onClick={() => toggleFavorite(product.id)}
                          >
                            {isFavorite ? <Favorite /> : <FavoriteBorder />}
                          </IconButton>
                        </Tooltip>
                        {product._grouped && (
                          <span className="catalog-card__variant-badge">
                            {t({
                              he: `${product._variantCount} גרסאות`,
                              en: `${product._variantCount} variants`,
                            })}
                          </span>
                        )}
                      </div>

                      <div className="catalog-card__body">
                        <span className="catalog-card__sku" dir="ltr">
                          {product.sku || `FY-${product.id}`}
                        </span>
                        <h2 dir="auto">
                          <RouterLink
                            to={detailsUrl}
                            state={{ catalogUrl }}
                          >
                            {name}
                          </RouterLink>
                        </h2>
                        <p className="catalog-card__description" dir="auto">
                          {description}
                        </p>

                        <div className="catalog-card__chips">
                          {product.generation && (
                            <span className="catalog-chip catalog-chip--generation">
                              {formatGeneration(product.generation)}
                            </span>
                          )}
                          {product.inStock ? (
                            <span className={`catalog-chip ${lowStock ? 'catalog-chip--low' : 'catalog-chip--stock'}`}>
                              {lowStock
                                ? t({ he: 'מלאי נמוך', en: 'Low stock' })
                                : t({ he: 'במלאי', en: 'In stock' })}
                            </span>
                          ) : (
                            <span className="catalog-chip catalog-chip--out">
                              {t({ he: 'אזל מהמלאי', en: 'Out of stock' })}
                            </span>
                          )}
                        </div>

                        <div className="catalog-card__price-block">
                          <span>
                            {product._grouped
                              ? t({ he: 'החל מ־', en: 'Starting at' })
                              : t({ he: 'מחיר', en: 'Price' })}
                          </span>
                          <strong dir="ltr">
                            {formatPrice.format(product._startingPrice)}
                          </strong>
                        </div>

                        <div className="catalog-card__actions">
                          <Button
                            component={RouterLink}
                            to={detailsUrl}
                            state={{ catalogUrl }}
                            variant="outlined"
                          >
                            {t({ he: 'פרטים', en: 'View details' })}
                          </Button>
                          {product._grouped ? (
                            <Button
                              component={RouterLink}
                              to={detailsUrl}
                              state={{ catalogUrl }}
                              variant="contained"
                              startIcon={<TuneOutlined />}
                            >
                              {t({ he: 'בחרו גרסה', en: 'Configure' })}
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <AddShoppingCart />}
                              disabled={!product.inStock || isPending}
                              aria-busy={isPending}
                              onClick={() => handleAddToCart(product)}
                            >
                              {isPending
                                ? t({ he: 'מוסיף…', en: 'Adding…' })
                                : t({ he: 'הוסיפו לסל', en: 'Add to cart' })}
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          id: 'catalog-mobile-filters',
          'data-testid': 'catalog-filter-drawer',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': t({ he: 'מסנני קטלוג', en: 'Catalog filters' }),
          className: `catalog-filter-drawer catalog-filter-drawer--${mode}`,
          dir: isRtl ? 'rtl' : 'ltr',
        }}
      >
        {renderFilters(true)}
      </Drawer>
    </Box>
  );
}

export default ProductsPage;
