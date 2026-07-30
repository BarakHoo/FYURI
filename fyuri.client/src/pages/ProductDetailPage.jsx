import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
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
} from '@mui/material';
import { ShoppingCart, ArrowBack } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { formatGeneration, getGenerationColor } from '../utils/generationUtils';

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
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [tubes, setTubes] = useState([]);
  const [selectedTubeId, setSelectedTubeId] = useState('');
  const [g24Mount, setG24Mount] = useState(null);
  const [includeG24, setIncludeG24] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { language, t } = useLanguage();

  useEffect(() => {
    fetchProduct();
    // Reset add-on selections when navigating between products
    setSelectedTubeId('');
    setIncludeG24(false);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);

        // If this product belongs to a variant group, load its siblings
        const group = data.specifications?.VariantGroup;
        if (group && data.productType) {
          const listRes = await fetch(`/api/products?productType=${encodeURIComponent(data.productType)}`);
          if (listRes.ok) {
            const all = await listRes.json();
            const siblings = all
              .filter((p) => p.specifications?.VariantGroup === group)
              .sort((a, b) => a.price - b.price);
            setVariants(siblings);
          }
        } else {
          setVariants([]);
        }

        // Housings: offer intensifier tubes and the G24 mount bundle
        if (data.productType === 'housing') {
          const [tubesRes, accRes] = await Promise.all([
            fetch('/api/products?productType=intensifier'),
            fetch('/api/products?productType=accessories'),
          ]);
          if (tubesRes.ok) {
            const tubeList = await tubesRes.json();
            setTubes(tubeList.sort((a, b) => a.price - b.price));
          }
          if (accRes.ok) {
            const accessories = await accRes.json();
            setG24Mount(accessories.find((p) => p.sku === G24_SKU) || null);
          }
        } else {
          setTubes([]);
          setG24Mount(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    }
  };

  const handleVariantChange = (e) => {
    const newId = e.target.value;
    if (String(newId) !== String(id)) {
      navigate(`/products/${newId}`, { replace: true });
    }
  };

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
    if (!product) return;
    await addToCart(product, quantity);
    if (selectedTube) {
      await addToCart(selectedTube, tubeQuantity);
    }
    if (includeG24 && g24Mount) {
      await addToCart(g24Mount, 1);
    }
  };

  if (!product) {
    return (
      <Typography>
        {t({ he: 'טוען...', en: 'Loading...' })}
      </Typography>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/products')}
        sx={{ mb: 3 }}
      >
        {t({ he: 'חזור לקטלוג', en: 'Back to Catalog' })}
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              width: '100%',
              paddingTop: '100%',
              bgcolor: 'grey.800',
              position: 'relative',
              overflow: 'hidden',
              backgroundImage: product.thumbnailUrl || product.imageUrls?.[0] 
                ? `url(${product.thumbnailUrl || product.imageUrls[0]})` 
                : 'none',
              backgroundSize: 'cover',
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
          <Typography variant="h3" component="h1" gutterBottom>
            {language === 'he' ? (product.nameHebrew || product.name) : product.name}
          </Typography>

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

          <Typography variant="body1" color="text.secondary" paragraph>
            {language === 'he' 
              ? (product.descriptionHebrew || product.description)
              : product.description
            }
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

          <Typography variant="h4" color="primary" sx={{ my: 3 }}>
            ₪{product.price.toLocaleString()}
          </Typography>

          {product.productType === 'housing' && tubes.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
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
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                InputProps={{ inputProps: { min: 1, max: product.stockQuantity } }}
                sx={{ width: 100, mr: 2 }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
              >
                {t({ he: 'הוסף לסל', en: 'Add to Cart' })}
              </Button>
            </Box>
          )}

          <Paper sx={{ p: 2, mt: 4 }}>
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
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProductDetailPage;
