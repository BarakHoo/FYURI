import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  BuildOutlined,
  ImageNotSupportedOutlined,
  ShoppingCart,
} from '@mui/icons-material';
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router';
import { resolveAssetUrl } from '../apiConfig';
import PublicPageShell from '../components/PublicPageShell';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getBuilderUrl } from '../data/builderPresets';
import { formatGeneration } from '../utils/generationUtils';
import './EquipmentPages.css';

const G24_SKU = 'BLD-MOUNT-G24';
const hiddenSpecificationKeys = new Set(['variantgroup', 'variantlabel']);

const variantLabel = (product, language) => {
  const raw = product?.specifications?.VariantLabel;
  if (!raw) {
    return language === 'he'
      ? (product?.nameHebrew || product?.name || '')
      : (product?.name || product?.nameHebrew || '');
  }

  const [english, hebrew] = raw.split('|');
  return language === 'he' ? (hebrew || english) : english;
};

const displaySpecificationValue = (value, t) => {
  if (typeof value === 'boolean') {
    return value
      ? t({ he: 'כן', en: 'Yes' })
      : t({ he: 'לא', en: 'No' });
  }
  if (Array.isArray(value)) return value.filter(Boolean).join(' · ');
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'string') return value.trim();
  return '';
};

const humanizeSpecificationKey = (key) => String(key)
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/[_-]+/g, ' ')
  .replace(/\b\w/g, (character) => character.toUpperCase());

const productImages = (product) => {
  const paths = [product?.thumbnailUrl, ...(product?.imageUrls || [])]
    .filter((path) => typeof path === 'string' && path.trim())
    .map((path) => resolveAssetUrl(path.trim()));
  return [...new Set(paths)];
};

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [tubes, setTubes] = useState([]);
  const [selectedTubeId, setSelectedTubeId] = useState('');
  const [g24Mount, setG24Mount] = useState(null);
  const [includeG24, setIncludeG24] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const { addToCart } = useCart();
  const { language, t } = useLanguage();

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setLoadError(null);
      setProduct(null);
      setVariants([]);
      setTubes([]);
      setG24Mount(null);
      setSelectedImage('');
      setAddError('');

      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          const error = new Error('Product request failed');
          error.status = response.status;
          throw error;
        }

        const data = await response.json();
        let nextVariants = [];
        let nextTubes = [];
        let nextG24Mount = null;

        const group = data.specifications?.VariantGroup;
        if (group && data.productType) {
          const listResponse = await fetch(
            `/api/products?productType=${encodeURIComponent(data.productType)}`,
          );
          if (listResponse.ok) {
            const all = await listResponse.json();
            nextVariants = all
              .filter((candidate) => candidate.specifications?.VariantGroup === group)
              .sort((left, right) => Number(left.price || 0) - Number(right.price || 0));
          }
        }

        if (data.productType === 'housing') {
          const [tubesResponse, accessoriesResponse] = await Promise.all([
            fetch('/api/products?productType=intensifier'),
            fetch('/api/products?productType=accessories'),
          ]);
          if (tubesResponse.ok) {
            nextTubes = (await tubesResponse.json())
              .sort((left, right) => Number(left.price || 0) - Number(right.price || 0));
          }
          if (accessoriesResponse.ok) {
            const accessories = await accessoriesResponse.json();
            nextG24Mount = accessories.find((candidate) => candidate.sku === G24_SKU) || null;
          }
        }

        if (!cancelled) {
          setSelectedTubeId('');
          setIncludeG24(false);
          setQuantity(1);
          setAdding(false);
          setProduct(data);
          setVariants(nextVariants);
          setTubes(nextTubes);
          setG24Mount(nextG24Mount);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        if (!cancelled) {
          setLoadError(error.status === 400 || error.status === 404 ? 'not-found' : 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const catalogUrl = (
    typeof location.state?.catalogUrl === 'string'
    && location.state.catalogUrl.startsWith('/products')
  )
    ? location.state.catalogUrl
    : '/products';

  const handleVariantChange = (event) => {
    const newId = event.target.value;
    if (String(newId) !== String(id)) {
      navigate(`/products/${newId}`, {
        replace: true,
        state: location.state,
      });
    }
  };

  const images = useMemo(() => productImages(product), [product]);
  const currentImage = selectedImage && images.includes(selectedImage)
    ? selectedImage
    : images[0];

  if (loading) {
    return (
      <PublicPageShell
        eyebrow={t({ he: 'FYURI / מוצר', en: 'FYURI / PRODUCT' })}
        title={t({ he: 'טוען את פרטי המוצר…', en: 'Loading product details…' })}
        contentClassName="equipment-page"
      >
        <Box className="equipment-state-panel" role="status">
          <CircularProgress aria-label={t({ he: 'טוען מוצר', en: 'Loading product' })} />
        </Box>
      </PublicPageShell>
    );
  }

  if (loadError || !product) {
    const notFound = loadError === 'not-found';
    return (
      <PublicPageShell
        eyebrow={t({ he: 'FYURI / מוצר', en: 'FYURI / PRODUCT' })}
        title={notFound
          ? t({ he: 'המוצר לא נמצא.', en: 'Product not found.' })
          : t({ he: 'לא הצלחנו לטעון את המוצר.', en: 'We could not load this product.' })}
        description={t({
          he: 'אפשר לחזור לקטלוג ולבחור מוצר אחר, או ליצור איתנו קשר לקבלת עזרה.',
          en: 'Return to the catalog to choose another product, or contact us for help.',
        })}
        contentClassName="equipment-page"
        actions={(
          <>
            <Button variant="contained" onClick={() => navigate('/products')}>
              {t({ he: 'חזרה לקטלוג', en: 'Back to catalog' })}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/contact')}>
              {t({ he: 'צור קשר', en: 'Contact us' })}
            </Button>
          </>
        )}
      >
        <Alert severity={notFound ? 'warning' : 'error'} className="equipment-state-panel">
          {notFound
            ? t({
              he: 'ייתכן שהמוצר הוסר או שהקישור שגוי.',
              en: 'The product may have been removed or the link may be incorrect.',
            })
            : t({
              he: 'אירעה שגיאת תקשורת. נסו שוב בעוד מספר רגעים.',
              en: 'A network error occurred. Please try again in a moment.',
            })}
        </Alert>
      </PublicPageShell>
    );
  }

  const productName = language === 'he'
    ? (product.nameHebrew || product.name)
    : (product.name || product.nameHebrew);
  const productDescription = language === 'he'
    ? (product.descriptionHebrew || product.description)
    : (product.description || product.descriptionHebrew);
  const builderUrl = getBuilderUrl(product);

  const rawStockQuantity = product.stockQuantity;
  const tracksStock = rawStockQuantity !== null
    && rawStockQuantity !== undefined
    && rawStockQuantity !== ''
    && Number.isFinite(Number(rawStockQuantity));
  const stockQuantity = tracksStock ? Math.max(0, Math.floor(Number(rawStockQuantity))) : null;
  const isAvailable = product.inStock === true && (!tracksStock || stockQuantity > 0);
  const isLowStock = isAvailable && tracksStock && stockQuantity <= 3;
  const maxQuantity = tracksStock ? stockQuantity : 99;

  const channelCount = (() => {
    const formFactor = String(product.specifications?.['Form Factor'] || '').toLowerCase();
    if (formFactor.includes('panoramic')) return 4;
    if (formFactor.includes('binocular')) return 2;
    return 1;
  })();

  const selectedTube = tubes.find((tube) => String(tube.id) === String(selectedTubeId)) || null;
  const tubeQuantity = quantity * channelCount;
  const bundleTotal =
    Number(product.price || 0) * quantity
    + (selectedTube ? Number(selectedTube.price || 0) * tubeQuantity : 0)
    + (includeG24 && g24Mount ? Number(g24Mount.price || 0) : 0);

  const priceFormatter = new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
    maximumFractionDigits: 0,
  });

  const standardSpecifications = [
    ['SKU', product.sku],
    [t({ he: 'קטגוריה', en: 'Category' }), product.productType],
    [t({ he: 'דור', en: 'Generation' }), product.generation && formatGeneration(product.generation)],
    [t({ he: 'סוג שפופרת', en: 'Tube type' }), product.tubeType],
    ['FOM', product.fom],
    [t({ he: 'רזולוציה', en: 'Resolution' }), product.resolution],
  ];
  const standardKeys = new Set(
    standardSpecifications
      .map(([label]) => String(label).trim().toLowerCase()),
  );
  const specificationRows = [
    ...standardSpecifications,
    ...Object.entries(product.specifications || {})
      .filter(([key]) => !hiddenSpecificationKeys.has(key.toLowerCase()))
      .map(([key, value]) => [humanizeSpecificationKey(key), value]),
  ]
    .map(([label, value]) => [label, displaySpecificationValue(value, t)])
    .filter(([label, value], index, all) => {
      if (!value) return false;
      const normalized = String(label).trim().toLowerCase();
      if (index < standardSpecifications.length) return true;
      if (standardKeys.has(normalized)) return false;
      return all.findIndex(([otherLabel]) => (
        String(otherLabel).trim().toLowerCase() === normalized
      )) === index;
    });

  const handleAddToCart = async () => {
    if (!product || adding || !isAvailable) return;
    setAdding(true);
    setAddError('');
    try {
      const productAdded = await addToCart(product, quantity);
      if (!productAdded) throw new Error('product');

      if (selectedTube) {
        const tubeAdded = await addToCart(selectedTube, tubeQuantity);
        if (!tubeAdded) throw new Error('bundle');
      }
      if (includeG24 && g24Mount) {
        const mountAdded = await addToCart(g24Mount, 1);
        if (!mountAdded) throw new Error('bundle');
      }
    } catch (error) {
      setAddError(error.message === 'bundle'
        ? t({
          he: 'חלק מהחבילה לא נוסף. בדקו את הסל לפני ניסיון נוסף כדי למנוע כפילות.',
          en: 'Part of the bundle was not added. Check your cart before retrying to avoid duplicates.',
        })
        : t({
          he: 'לא הצלחנו להוסיף את המוצר לסל. נסו שוב בעוד רגע.',
          en: 'We could not add this product to the cart. Please try again.',
        }));
    } finally {
      setAdding(false);
    }
  };

  return (
    <PublicPageShell
      eyebrow={`${String(product.productType || 'FYURI').toUpperCase()} / ${product.sku}`}
      breadcrumbLabel={productName}
      title={productName}
      description={productDescription}
      contentClassName="equipment-page equipment-product-detail"
      heroImage="/images/banners/catalog-night-ops.webp"
      actions={(
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(catalogUrl)}
          variant="outlined"
        >
          {t({ he: 'חזרה לקטלוג', en: 'Back to catalog' })}
        </Button>
      )}
    >
      <div className="equipment-detail-layout">
        <section className="equipment-panel equipment-media-panel" aria-label={t({
          he: `תמונות ${productName}`,
          en: `${productName} images`,
        })}>
          <div className="equipment-media-panel__main">
            {currentImage ? (
              <img
                src={currentImage}
                alt={productName}
                decoding="async"
                fetchPriority="high"
              />
            ) : (
              <div className="equipment-image-fallback">
                <ImageNotSupportedOutlined aria-hidden="true" />
                <span>{t({ he: 'אין תמונה זמינה', en: 'No image available' })}</span>
              </div>
            )}
            <span className="equipment-media-panel__index">
              {String(product.productType || 'optical system').toUpperCase()} / {product.sku}
            </span>
          </div>

          {images.length > 1 && (
            <div className="equipment-thumbnail-list" role="list">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={image === currentImage ? 'is-active' : undefined}
                  onClick={() => setSelectedImage(image)}
                  aria-pressed={image === currentImage}
                  aria-label={t({
                    he: `הצגת תמונה ${index + 1} מתוך ${images.length}`,
                    en: `Show image ${index + 1} of ${images.length}`,
                  })}
                  data-testid="product-gallery-thumbnail"
                >
                  <img src={image} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="equipment-panel equipment-purchase-panel">
          <span className="equipment-section-kicker">
            {t({ he: 'סקירת מערכת', en: 'SYSTEM OVERVIEW' })}
          </span>

          <div className="equipment-chip-row">
            {product.generation && (
              <span className="equipment-chip equipment-chip--generation">
                {formatGeneration(product.generation)}
              </span>
            )}
            <span className={`equipment-chip equipment-chip--${isAvailable ? (isLowStock ? 'low' : 'available') : 'unavailable'}`}>
              {isAvailable
                ? (isLowStock
                  ? t({
                    he: `מלאי נמוך · ${stockQuantity} נותרו`,
                    en: `Low stock · ${stockQuantity} left`,
                  })
                  : t({ he: 'במלאי', en: 'In stock' }))
                : t({ he: 'אזל מהמלאי', en: 'Out of stock' })}
            </span>
          </div>

          <p className="equipment-purchase-panel__description">{productDescription}</p>

          {variants.length > 1 && (
            <TextField
              select
              fullWidth
              className="equipment-select"
              label={t({ he: 'דגם / חומר', en: 'Variant / Material' })}
              value={product.id}
              onChange={handleVariantChange}
            >
              {variants.map((variant) => (
                <MenuItem key={variant.id} value={variant.id}>
                  {variantLabel(variant, language)} — ₪{priceFormatter.format(variant.price)}
                </MenuItem>
              ))}
            </TextField>
          )}

          <div className="equipment-price-block">
            <span>{t({ he: 'מחיר מערכת', en: 'System price' })}</span>
            <strong><i>₪</i>{priceFormatter.format(product.price)}</strong>
          </div>

          {product.productType === 'housing' && tubes.length > 0 && (
            <Paper variant="outlined" className="equipment-bundle-panel">
              <Typography component="h2">
                {t({ he: 'השלימו למכשיר מלא', en: 'Complete your device' })}
              </Typography>
              <TextField
                select
                fullWidth
                className="equipment-select"
                label={t({ he: 'הוספת שפופרת מגבר אור', en: 'Add an intensifier tube' })}
                value={selectedTubeId}
                onChange={(event) => {
                  setSelectedTubeId(event.target.value);
                  setAddError('');
                  if (event.target.value === '') setIncludeG24(false);
                }}
                helperText={channelCount > 1
                  ? t({
                    he: `גוף זה דורש ${channelCount} שפופרות — המחיר והכמות מוכפלים בהתאם.`,
                    en: `This housing requires ${channelCount} tubes; price and quantity are multiplied accordingly.`,
                  })
                  : t({
                    he: 'השפופרת מתווספת בנפרד לכל גוף.',
                    en: 'The tube is added separately for each housing.',
                  })}
              >
                <MenuItem value="">
                  {t({ he: 'ללא שפופרת — גוף בלבד', en: 'No tube — housing only' })}
                </MenuItem>
                {tubes.map((tube) => (
                  <MenuItem
                    key={tube.id}
                    value={tube.id}
                    disabled={tube.inStock === false || Number(tube.stockQuantity) === 0}
                  >
                    {language === 'he' ? (tube.nameHebrew || tube.name) : tube.name}
                    {' — '}
                    {channelCount > 1
                      ? `₪${priceFormatter.format(tube.price)} ×${channelCount} = ₪${priceFormatter.format(tube.price * channelCount)}`
                      : `₪${priceFormatter.format(tube.price)}`}
                  </MenuItem>
                ))}
              </TextField>

              {selectedTube && g24Mount && (
                <>
                  <Divider />
                  <FormControlLabel
                    disabled={g24Mount.inStock === false || Number(g24Mount.stockQuantity) === 0}
                    control={(
                      <Checkbox
                        checked={includeG24}
                        onChange={(event) => {
                          setIncludeG24(event.target.checked);
                          setAddError('');
                        }}
                      />
                    )}
                    label={t({
                      he: `הוספת ${g24Mount.nameHebrew || g24Mount.name} — ₪${priceFormatter.format(g24Mount.price)}`,
                      en: `Add ${g24Mount.name} — ₪${priceFormatter.format(g24Mount.price)}`,
                    })}
                  />
                </>
              )}

              {(selectedTube || (includeG24 && g24Mount)) && (
                <div className="equipment-bundle-total">
                  <span>{t({ he: 'סה״כ חבילה', en: 'Bundle total' })}</span>
                  <strong>₪{priceFormatter.format(bundleTotal)}</strong>
                </div>
              )}
            </Paper>
          )}

          <div className="equipment-purchase-actions">
            {isAvailable && (
              <TextField
                type="number"
                label={t({ he: 'כמות', en: 'Quantity' })}
                value={quantity}
                onChange={(event) => {
                  setAddError('');
                  setQuantity(Math.min(
                    maxQuantity,
                    Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                  ));
                }}
                slotProps={{ htmlInput: { min: 1, max: maxQuantity } }}
              />
            )}
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={!isAvailable || adding}
            >
              {adding
                ? t({ he: 'מוסיף…', en: 'Adding…' })
                : (isAvailable
                  ? t({ he: 'הוסף לסל', en: 'Add to Cart' })
                  : t({ he: 'אזל מהמלאי', en: 'Out of stock' }))}
            </Button>
            {builderUrl && (
              <Button
                component={RouterLink}
                to={builderUrl}
                variant="outlined"
                startIcon={<BuildOutlined />}
                data-testid="configure-product-detail"
              >
                {t({ he: 'התאם בממשק הבנייה', en: 'Configure' })}
              </Button>
            )}
          </div>

          {addError && (
            <Alert severity="error" className="equipment-inline-alert" role="alert">
              {addError}
            </Alert>
          )}
        </section>
      </div>

      <section className="equipment-panel equipment-specification-panel">
        <div className="equipment-section-heading">
          <span className="equipment-section-kicker">
            {t({ he: 'נתוני מערכת', en: 'SYSTEM DATA' })}
          </span>
          <h2>{t({ he: 'מפרט טכני', en: 'Technical specifications' })}</h2>
          <p>{t({
            he: 'המידע הטכני המלא שסופק עבור תצורה זו.',
            en: 'Complete technical information supplied for this configuration.',
          })}</p>
        </div>

        {specificationRows.length > 0 ? (
          <dl className="equipment-spec-grid">
            {specificationRows.map(([label, value]) => (
              <div key={`${label}-${value}`}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="equipment-empty-copy">
            {t({
              he: 'המפרט המלא זמין מצוות FYURI.',
              en: 'The complete specification is available from the FYURI team.',
            })}
          </p>
        )}
      </section>
    </PublicPageShell>
  );
}

export default ProductDetailPage;
