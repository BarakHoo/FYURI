import { useEffect, useState } from 'react';
import { Add, Delete, Inventory2Outlined, Remove, ShoppingCart } from '@mui/icons-material';
import { Box, Button, CircularProgress, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router';
import PublicPageShell from '../components/PublicPageShell';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartLoading = false,
    updateQuantity,
    removeFromCart,
    getCartTotal,
  } = useCart();
  const { language, t } = useLanguage();
  const [products, setProducts] = useState({});

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      const productMap = {};
      for (const item of cart) {
        if (!productMap[item.productId]) {
          try {
            const response = await fetch(`/api/products/${item.productId}`);
            if (response.ok) {
              productMap[item.productId] = await response.json();
            }
          } catch (error) {
            console.error('Failed to fetch product:', error);
          }
        }
      }
      if (!cancelled) setProducts(productMap);
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [cart]);

  if (cartLoading) {
    return (
      <PublicPageShell
        eyebrow={t({ he: 'FYURI / סל', en: 'FYURI / CART' })}
        title={t({ he: 'טוען את הסל…', en: 'Loading your cart…' })}
      >
        <Box className="fy-panel fy-public-empty">
          <CircularProgress aria-label={t({ he: 'טוען סל', en: 'Loading cart' })} />
        </Box>
      </PublicPageShell>
    );
  }

  if (cart.length === 0) {
    return (
      <PublicPageShell
        eyebrow={t({ he: 'FYURI / סל', en: 'FYURI / CART' })}
        title={t({ he: 'הסל מוכן לתצורה הבאה.', en: 'Your cart is ready for the next configuration.' })}
        description={t({
          he: 'הסל ריק כרגע. אפשר לחזור לקטלוג או לפתוח את בונה המכשירים.',
          en: 'Your cart is currently empty. Return to the catalog or open the device builder.',
        })}
      >
        <Box className="fy-panel fy-public-empty">
          <ShoppingCart sx={{ fontSize: 58, color: '#42baf2', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            {t({ he: 'הסל שלך ריק', en: 'Your cart is empty' })}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 3 }}>
            <Button component={RouterLink} to="/products" variant="contained" startIcon={<Inventory2Outlined />}>
              {t({ he: 'המשך לקטלוג', en: 'Continue shopping' })}
            </Button>
            <Button component={RouterLink} to="/builder" variant="outlined">
              {t({ he: 'בניית מכשיר', en: 'Build a device' })}
            </Button>
          </Stack>
        </Box>
      </PublicPageShell>
    );
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <PublicPageShell
      eyebrow={t({ he: 'FYURI / סל', en: 'FYURI / CART' })}
      title={t({ he: 'סקירת הסל', en: 'Review your cart' })}
      description={t({
        he: 'בדקו את המערכות, הרכיבים והכמויות לפני שליחת פרטי ההזמנה.',
        en: 'Review systems, components and quantities before submitting your order request.',
      })}
      actions={(
        <Button component={RouterLink} to="/products" variant="outlined" startIcon={<Inventory2Outlined />}>
          {t({ he: 'המשך לקטלוג', en: 'Continue shopping' })}
        </Button>
      )}
    >
      <Box className="fy-public-grid">
        <Box className="fy-public-grid__main">
          {cart.map((item) => {
            const product = products[item.productId];
            const productName = language === 'he'
              ? (product?.nameHebrew || product?.name)
              : product?.name;

            return (
              <Paper key={item.id} className="fy-panel fy-panel--interactive fy-cart-item">
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <Typography
                      component={product ? RouterLink : 'p'}
                      to={product ? `/products/${item.productId}` : undefined}
                      variant="h6"
                      sx={{ color: '#f5f7f8 !important', fontWeight: 800, textDecoration: 'none' }}
                    >
                      {productName || t({ he: 'טוען מוצר...', en: 'Loading product…' })}
                    </Typography>
                    <Typography variant="body2" className="fy-muted">{product?.sku}</Typography>
                  </Grid>
                  <Grid item xs={5} sm={2}>
                    <Typography sx={{ color: '#42baf2', fontWeight: 800 }}>
                      ₪{item.priceAtAddTime.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={7} sm={4}>
                    <Stack direction="row" alignItems="center" justifyContent={{ xs: 'flex-end', sm: 'flex-start' }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label={t({ he: `הפחת כמות של ${productName || ''}`, en: `Decrease quantity of ${productName || 'item'}` })}
                      >
                        <Remove />
                      </IconButton>
                      <Typography sx={{ mx: 1.5, minWidth: 24, textAlign: 'center', fontWeight: 800 }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label={t({ he: `הגדל כמות של ${productName || ''}`, en: `Increase quantity of ${productName || 'item'}` })}
                      >
                        <Add />
                      </IconButton>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={1} sx={{ textAlign: { xs: 'end', sm: 'center' } }}>
                    <IconButton
                      color="error"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={t({ he: `הסר ${productName || 'מוצר'} מהסל`, en: `Remove ${productName || 'item'} from cart` })}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Box>

        <Box className="fy-public-grid__side">
          <Paper className="fy-panel fy-sticky-summary">
            <span className="fy-section-kicker">{t({ he: 'סיכום', en: 'Summary' })}</span>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
              {t({ he: 'סיכום הזמנה', en: 'Order summary' })}
            </Typography>
            <Stack spacing={1.5} sx={{ my: 3 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography className="fy-muted">{t({ he: 'סה״כ פריטים', en: 'Total items' })}</Typography>
                <Typography sx={{ fontWeight: 800 }}>{totalItems}</Typography>
              </Stack>
              <Box sx={{ pt: 2, borderTop: '1px solid #152631' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{t({ he: 'סה״כ', en: 'Total' })}</Typography>
                  <Typography className="fy-product-price">₪{getCartTotal().toLocaleString()}</Typography>
                </Stack>
              </Box>
            </Stack>
            <Button variant="contained" fullWidth size="large" onClick={() => navigate('/checkout')}>
              {t({ he: 'המשך להשארת פרטים', en: 'Continue to details' })}
            </Button>
            <Typography variant="caption" className="fy-muted" sx={{ display: 'block', mt: 1.5, lineHeight: 1.5 }}>
              {t({
                he: 'לא יתבצע חיוב באתר. נציג יחזור אליכם להשלמת ההזמנה.',
                en: 'No charge is made online. Our team will contact you to finalize the order.',
              })}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </PublicPageShell>
  );
}

export default CartPage;
