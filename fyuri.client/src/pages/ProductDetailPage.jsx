import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router';
import {
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Chip,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ShoppingCart, ArrowBack } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { formatGeneration, getGenerationColor } from '../utils/generationUtils';
import PublicPageShell from '../components/PublicPageShell';

// Label stored as "English|Hebrew" in specifications.VariantLabel
const variantLabel = (p, language) => {
  const raw = p?.specifications?.VariantLabel;
  if (!raw) return p?.name || '';
  const [en, he] = raw.split('|');
  return language === 'he' ? (he || en) : en;
};

const G24_SKU = 'BLD-MOUNT-G24';

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
          const listRes = await fetch(`/api/products?productType=${encodeURIComponent(data.productType)}`);
          if (listRes.ok) {
            const all = await listRes.json();
            nextVariants = all
              .filter((candidate) => candidate.specifications?.VariantGroup === group)
              .sort((a, b) => a.price - b.price);
          }
        }

        if (data.productType === 'housing') {
          const [tubesRes, accessoriesRes] = await Promise.all([
            fetch('/api/products?productType=intensifier'),
            fetch('/api/products?productType=accessories'),
          ]);
          if (tubesRes.ok) {
            nextTubes = (await tubesRes.json()).sort((a, b) => a.price - b.price);
          }
          if (accessoriesRes.ok) {
            const accessories = await accessoriesRes.json();
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

  const handleVariantChange = (e) => {
    const newId = e.target.value;
    if (String(newId) !== String(id)) {
      navigate(`/products/${newId}`, {
        replace: true,
        state: location.state,
      });
    }
  };

  const catalogUrl = (
    typeof location.state?.catalogUrl === 'string'
    && location.state.catalogUrl.startsWith('/products')
  )
    ? location.state.catalogUrl
    : '/products';

  // Tubes are per-channel parts (same rule as the custom builder):
  // monocular = 1, binocular = 2, panoramic = 4 — derived from the housing's Form Factor spec.
  const channelCount = (() => {
    const ff = (product?.specifications?.['Form Factor'] || '').toLowerCase();
    if (ff.includes('panoramic')) return 4;
    if (ff.includes('binocular')) return 2;
    return 1;
  })();

  const selectedTube = tubes.find((tb) => tb.id === selectedTubeId) || null;
  const tubeQuantity = quantity * channelCount;
  const bundleTotal =
    (product?.price || 0) * quantity +
    (selectedTube ? selectedTube.price * tubeQuantity : 0) +
    (includeG24 && g24Mount ? g24Mount.price : 0);

  const handleAddToCart = async () => {
    if (!product || adding) return;
    setAdding(true);
    try {
      await addToCart(product, quantity);
      if (selectedTube) {
        await addToCart(selectedTube, tubeQuantity);
      }
      if (includeG24 && g24Mount) {
        await addToCart(g24Mount, 1);
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <PublicPageShell
        eyebrow={t({ he: 'FYURI / מוצר', en: 'FYURI / PRODUCT' })}
        title={t({ he: 'טוען את פרטי המוצר…', en: 'Loading product details…' })}
      >
        <Box className="fy-panel fy-public-empty">
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
        <Alert severity={notFound ? 'warning' : 'error'} className="fy-panel">
          {notFound
            ? t({ he: 'ייתכן שהמוצר הוסר או שהקישור שגוי.', en: 'The product may have been removed or the link may be incorrect.' })
            : t({ he: 'אירעה שגיאת תקשורת. נסו שוב בעוד מספר רגעים.', en: 'A network error occurred. Please try again in a moment.' })}
        </Alert>
      </PublicPageShell>
    );
  }

  const productName = language === 'he'
    ? (product.nameHebrew || product.name)
    : product.name;
  const productDescription = language === 'he'
    ? (product.descriptionHebrew || product.description)
    : product.description;

  return (
    <PublicPageShell
      eyebrow={`${product.productType || 'FYURI'} / ${product.sku}`}
      title={productName}
      description={productDescription}
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

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper
            className="fy-panel fy-product-media"
            sx={{
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
              minHeight: { xs: 360, md: 560 },
              backgroundImage: product.thumbnailUrl || product.imageUrls?.[0] 
                ? `url(${product.thumbnailUrl || product.imageUrls[0]})` 
                : 'none',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {!product.thumbnailUrl && !product.imageUrls?.[0] && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'grey.500',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2">
                  {t({ he: 'אין תמונה', en: 'No Image' })}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="fy-panel" sx={{ p: { xs: 2.5, md: 3.5 }, textAlign: 'start' }}>
          <span className="fy-section-kicker">{t({ he: 'סקירת מוצר', en: 'Product overview' })}</span>

          <Box sx={{ mb: 3 }}>
            {product.generation && (
              <Chip 
                label={formatGeneration(product.generation)} 
                {...getGenerationColor(product.generation)}
                sx={{ mr: 1, ...getGenerationColor(product.generation).sx }} 
              />
            )}
            {product.inStock ? (
              <Chip label={t({ he: 'במלאי', en: 'In Stock' })} color="success" />
            ) : (
              <Chip label={t({ he: 'אזל מהמלאי', en: 'Out of Stock' })} color="error" />
            )}
          </Box>

          <Typography variant="body1" className="fy-muted" paragraph sx={{ lineHeight: 1.7 }}>
            {productDescription}
          </Typography>

          {variants.length > 1 && (
            <TextField
              select
              label={t({ he: 'דגם / חומר', en: 'Variant / Material' })}
              value={product.id}
              onChange={handleVariantChange}
              sx={{ minWidth: 260, mb: 1 }}
            >
              {variants.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {variantLabel(v, language)} — ₪{v.price.toLocaleString()}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Typography className="fy-product-price" sx={{ my: 3 }}>
            ₪{product.price.toLocaleString()}
          </Typography>

          {product.productType === 'housing' && tubes.length > 0 && (
            <Paper variant="outlined" className="fy-panel" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                {t({ he: 'השלם למכשיר מלא', en: 'Complete Your Device' })}
              </Typography>
              <TextField
                select
                fullWidth
                label={t({ he: 'הוסף שפופרת מגבר אור', en: 'Add an Intensifier Tube' })}
                value={selectedTubeId}
                onChange={(e) => {
                  setSelectedTubeId(e.target.value);
                  if (e.target.value === '') setIncludeG24(false);
                }}
                helperText={
                  channelCount > 1
                    ? t({
                        he: `גוף זה דורש ${channelCount} שפופרות (אחת לכל ערוץ) — המחיר והכמות יוכפלו בהתאם`,
                        en: `This housing requires ${channelCount} tubes (one per channel) — price and quantity multiply accordingly`,
                      })
                    : t({
                        he: 'השפופרת תתווסף לסל בנפרד בהתאם לכמות הגופים',
                        en: 'The tube is added per housing quantity',
                      })
                }
              >
                <MenuItem value="">
                  {t({ he: 'ללא שפופרת — גוף בלבד', en: 'No tube — housing only' })}
                </MenuItem>
                {tubes.map((tube) => (
                  <MenuItem key={tube.id} value={tube.id}>
                    {language === 'he' ? (tube.nameHebrew || tube.name) : tube.name}
                    {' — '}
                    {channelCount > 1
                      ? `₪${tube.price.toLocaleString()} ×${channelCount} = ₪${(tube.price * channelCount).toLocaleString()}`
                      : `₪${tube.price.toLocaleString()}`}
                  </MenuItem>
                ))}
              </TextField>

              {selectedTube && g24Mount && (
                <Box sx={{ mt: 1.5 }}>
                  <Divider sx={{ mb: 1.5 }} />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeG24}
                        onChange={(e) => setIncludeG24(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {t({
                          he: `מרכיב מכשיר מלא? הוסף מתקן קסדה ${g24Mount.nameHebrew || g24Mount.name} — ₪${g24Mount.price.toLocaleString()}`,
                          en: `Building a complete device? Add a ${g24Mount.name} — ₪${g24Mount.price.toLocaleString()}`,
                        })}
                      </Typography>
                    }
                  />
                </Box>
              )}

              {(selectedTube || (includeG24 && g24Mount)) && (
                <Typography variant="subtitle1" color="primary" sx={{ mt: 1.5, fontWeight: 600 }}>
                  {t({ he: 'סה״כ חבילה:', en: 'Bundle total:' })} ₪{bundleTotal.toLocaleString()}
                  {selectedTube && tubeQuantity > 1 && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {t({
                        he: `(כולל ${tubeQuantity} שפופרות)`,
                        en: `(includes ${tubeQuantity} tubes)`,
                      })}
                    </Typography>
                  )}
                </Typography>
              )}
            </Paper>
          )}

          {product.inStock && (
            <Box sx={{ mb: 3 }}>
              <TextField
                type="number"
                label={t({ he: 'כמות', en: 'Quantity' })}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(
                  product.stockQuantity || 99,
                  Math.max(1, parseInt(e.target.value) || 1),
                ))}
                InputProps={{ inputProps: { min: 1, max: product.stockQuantity } }}
                sx={{ width: 100, mr: 2 }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={adding}
              >
                {adding
                  ? t({ he: 'מוסיף...', en: 'Adding…' })
                  : t({ he: 'הוסף לסל', en: 'Add to Cart' })}
              </Button>
            </Box>
          )}

          <Paper className="fy-panel" sx={{ p: 2, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t({ he: 'מפרט טכני', en: 'Technical Specifications' })}
            </Typography>
            <Typography variant="body2">SKU: {product.sku}</Typography>
            {product.generation && (
              <Typography variant="body2">
                {t({ he: 'דור:', en: 'Generation:' })} {formatGeneration(product.generation)}
              </Typography>
            )}
            {product.fom && (
              <Typography variant="body2">FOM: {product.fom}</Typography>
            )}
            {product.resolution && (
              <Typography variant="body2">
                {t({ he: 'רזולוציה:', en: 'Resolution:' })} {product.resolution}
              </Typography>
            )}
          </Paper>
          </Paper>
        </Grid>
      </Grid>
    </PublicPageShell>
  );
}

export default ProductDetailPage;
