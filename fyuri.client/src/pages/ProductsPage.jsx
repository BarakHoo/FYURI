import { useState, useEffect } from 'react';
import { 
  Typography, Grid, Card, CardMedia, CardContent, CardActions, Button, Box, Chip,
  Drawer, List, ListItem, ListItemButton, ListItemText, Divider, 
  FormGroup, FormControlLabel, Checkbox, useMediaQuery, useTheme,
  IconButton, Collapse
} from '@mui/material';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FilterList, ExpandMore, ExpandLess,
  Visibility, Security, Build, LocalShipping, RemoveRedEye, ViewComfy, Memory, Thermostat
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { formatGeneration, getGenerationColor } from '../utils/generationUtils';
import useSeo from '../hooks/useSeo';

const drawerWidth = 280;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [generationsOpen, setGenerationsOpen] = useState(true);
  const [selectedGenerations, setSelectedGenerations] = useState([]);

  const { addToCart } = useCart();
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useSeo({
    title: t({ he: 'מוצרים', en: 'Products' }),
    description: t({
      he: 'קטלוג מכשירי ראיית לילה, מגברי אור, גופים, אופטיקה ותרמי.',
      en: 'Catalog of night vision devices, image intensifier tubes, housings, optics and thermal.',
    }),
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const categories = [
    { 
      value: 'monocular', 
      labelHe: 'חד עיניים', 
      labelEn: 'Monoculars',
      icon: <Visibility fontSize="small" />
    },
    { 
      value: 'binocular', 
      labelHe: 'דו עיניים', 
      labelEn: 'Binoculars',
      icon: <RemoveRedEye fontSize="small" />
    },
    { 
      value: 'panoramic', 
      labelHe: 'ארבע-עיניים', 
      labelEn: 'Panoramic',
      icon: <ViewComfy fontSize="small" />
    },
    { 
      value: 'intensifier', 
      labelHe: 'מגברי אור', 
      labelEn: 'Image Intensifiers',
      icon: <Memory fontSize="small" />
    },
    { 
      value: 'optics', 
      labelHe: 'עדשות ואופטיקה', 
      labelEn: 'Lenses & Optics',
      icon: <Build fontSize="small" />
    },
    { 
      value: 'thermal', 
      labelHe: 'תרמי', 
      labelEn: 'Thermal',
      icon: <Thermostat fontSize="small" />
    },
    { 
      value: 'housing', 
      labelHe: 'גופים', 
      labelEn: 'Housings',
      icon: <Build fontSize="small" />
    },
    { 
      value: 'accessories', 
      labelHe: 'אביזרים', 
      labelEn: 'Accessories',
      icon: <LocalShipping fontSize="small" />
    },
  ];

  const generations = ['Gen 1', 'Gen 2', 'Gen 2+', 'Gen 3'];

  // Generation is only meaningful for night vision units and intensifier tubes
  const generationCategories = ['monocular', 'binocular', 'panoramic', 'intensifier'];
  const currentCategory = searchParams.get('category');
  const showGenerationFilter = !currentCategory || generationCategories.includes(currentCategory);

  useEffect(() => {
    if (!showGenerationFilter && selectedGenerations.length > 0) {
      setSelectedGenerations([]);
    }
  }, [showGenerationFilter]);

  const fetchProducts = async () => {
    try {
      const category = searchParams.get('category');
      const url = category 
        ? `/api/products?productType=${encodeURIComponent(category)}` 
        : '/api/products';

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryValue) => {
    if (categoryValue) {
      navigate(`/products?category=${categoryValue}`);
    } else {
      navigate('/products');
    }
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleGenerationToggle = (generation) => {
    setSelectedGenerations(prev => 
      prev.includes(generation)
        ? prev.filter(g => g !== generation)
        : [...prev, generation]
    );
  };

  // Normalize any generation value ("Gen 2+ (4G)", "gen2+", "2+", "Gen 3") to a
  // canonical token like "2+" or "3" so filter checkboxes match real data.
  const normalizeGeneration = (value) => {
    if (!value) return null;
    const match = String(value).toLowerCase().replace(/gen\s*/, '').match(/^\s*([0-9]\+?)/);
    return match ? match[1] : null;
  };

  const filteredProducts = selectedGenerations.length > 0
    ? products.filter(p =>
        selectedGenerations.some(g => normalizeGeneration(g) === normalizeGeneration(p.generation))
      )
    : products;

  // Collapse variant groups (e.g. Chimera housing materials) into a single card;
  // the variant choice is made via a dropdown on the product detail page.
  const displayProducts = [];
  const seenVariantGroups = new Set();
  for (const p of filteredProducts) {
    const group = p.specifications?.VariantGroup;
    if (group) {
      if (seenVariantGroups.has(group)) continue;
      seenVariantGroups.add(group);
    }
    displayProducts.push(p);
  }

  const handleAddToCart = async (product) => {
    await addToCart(product);
  };

  const getCategoryTitle = () => {
    const category = searchParams.get('category');
    if (!category) {
      return t({ he: 'קטלוג מוצרים', en: 'Product Catalog' });
    }

    const categoryInfo = categories.find(c => c.value === category);
    return categoryInfo 
      ? (language === 'he' ? categoryInfo.labelHe : categoryInfo.labelEn)
      : t({ he: 'קטלוג מוצרים', en: 'Product Catalog' });
  };

  const drawer = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t({ he: 'סינון מוצרים', en: 'Filter Products' })}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Categories Section */}
      <ListItemButton onClick={() => setCategoriesOpen(!categoriesOpen)}>
        <ListItemText 
          primary={t({ he: 'קטגוריות', en: 'Categories' })} 
          primaryTypographyProps={{ fontWeight: 'bold' }}
        />
        {categoriesOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={categoriesOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              selected={!searchParams.get('category')}
              onClick={() => handleCategorySelect(null)}
              sx={{ pl: 2 }}
            >
              <ListItemText 
                primary={t({ he: 'הכל', en: 'All Products' })} 
              />
            </ListItemButton>
          </ListItem>
          {categories.map((category) => (
            <ListItem key={category.value} disablePadding>
              <ListItemButton
                selected={searchParams.get('category') === category.value}
                onClick={() => handleCategorySelect(category.value)}
                sx={{ pl: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {category.icon}
                  <ListItemText 
                    primary={language === 'he' ? category.labelHe : category.labelEn} 
                  />
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Collapse>

      {showGenerationFilter && (
        <>
          <Divider sx={{ my: 2 }} />

          {/* Generation Filter Section */}
          <ListItemButton onClick={() => setGenerationsOpen(!generationsOpen)}>
            <ListItemText 
              primary={t({ he: 'דור', en: 'Generation' })} 
              primaryTypographyProps={{ fontWeight: 'bold' }}
            />
            {generationsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={generationsOpen} timeout="auto" unmountOnExit>
            <FormGroup sx={{ pl: 2, mt: 1 }}>
              {generations.map((gen) => (
                <FormControlLabel
                  key={gen}
                  control={
                    <Checkbox
                      checked={selectedGenerations.includes(gen)}
                      onChange={() => handleGenerationToggle(gen)}
                      size="small"
                    />
                  }
                  label={formatGeneration(gen)}
                />
              ))}
            </FormGroup>
          </Collapse>
        </>
      )}

      {selectedGenerations.length > 0 && (
        <Button
          size="small"
          onClick={() => setSelectedGenerations([])}
          sx={{ mt: 2, width: '100%' }}
        >
          {t({ he: 'נקה סינון', en: 'Clear Filters' })}
        </Button>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar placeholder */}
        <Box
          sx={{
            width: { md: drawerWidth },
            flexShrink: { md: 0 },
            display: { xs: 'none', md: 'block' }
          }}
        />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Typography>
            {t({ he: 'טוען מוצרים...', en: 'Loading products...' })}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: 108,
            height: 'calc(100vh - 108px)',
            zIndex: 1100
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1,
          p: { xs: 2, md: 4 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <FilterList />
            </IconButton>
          )}
          <Typography variant="h4" component="h1">
            {getCategoryTitle()}
          </Typography>
        </Box>

        {selectedGenerations.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t({ he: 'מסנן לפי:', en: 'Filtering by:' })}
            </Typography>
            {selectedGenerations.map(gen => (
              <Chip
                key={gen}
                label={formatGeneration(gen)}
                size="small"
                onDelete={() => handleGenerationToggle(gen)}
                {...getGenerationColor(gen)}
                sx={{ ...getGenerationColor(gen).sx }}
              />
            ))}
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t({ 
            he: `מציג ${displayProducts.length} מוצרים`, 
            en: `Showing ${displayProducts.length} products` 
          })}
        </Typography>

        <Grid container spacing={4}>
          {displayProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  bgcolor: 'grey.800',
                }}
                image={product.thumbnailUrl || '/placeholder.jpg'}
              />
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  {language === 'he' ? (product.nameHebrew || product.name) : product.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3,
                    overflow: 'hidden'
                  }}
                >
                  {language === 'he' 
                    ? (product.descriptionHebrew || product.description)
                    : product.description
                  }
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {product.generation && (
                    <Chip 
                      label={formatGeneration(product.generation)} 
                      size="small" 
                      {...getGenerationColor(product.generation)}
                      sx={{ ...getGenerationColor(product.generation).sx }} 
                    />
                  )}
                  {product.inStock ? (
                    <Chip 
                      label={t({ he: 'במלאי', en: 'In Stock' })} 
                      size="small" 
                      color="success" 
                    />
                  ) : (
                    <Chip 
                      label={t({ he: 'אזל מהמלאי', en: 'Out of Stock' })} 
                      size="small" 
                      color="error" 
                    />
                  )}
                </Box>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                  ₪{product.price.toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                <Button
                  size="medium"
                  component={RouterLink}
                  to={`/products/${product.id}`}
                  fullWidth
                  variant="outlined"
                >
                  {t({ he: 'פרטים', en: 'Details' })}
                </Button>
                <Button
                  size="medium"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  fullWidth
                  variant="contained"
                >
                  {t({ he: 'הוסף לסל', en: 'Add to Cart' })}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Box>
    </Box>
  );
}

export default ProductsPage;
