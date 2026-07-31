import { useEffect, useState } from 'react';
import { Add, Delete, Inventory2Outlined, Remove, ShoppingCart } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router';
import PublicPageShell from '../components/PublicPageShell';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartLoading = false,
    cartError,
    cartMutationError,
    clearCartMutationError,
    retryCart,
    updateQuantity,
    removeFromCart,
    getCartTotal,
  } = useCart();
  const { language, t } = useLanguage();
  const [products, setProducts] = useState({});
  const [pendingItemId, setPendingItemId] = useState(null);
  const [failedMutation, setFailedMutation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      const productMap = {};
      for (const item of cart) {
        if (item.product) {
          productMap[item.productId] = item.product;
          continue;
        }

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

  const mutateCart = async (operation) => {
    setPendingItemId(operation.itemId);
    setFailedMutation(null);
    clearCartMutationError?.();

    const succeeded = operation.type === 'remove'
      ? await removeFromCart(operation.itemId)
      : await updateQuantity(operation.itemId, operation.quantity);

    if (!succeeded) setFailedMutation(operation);
    setPendingItemId(null);
  };

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

  if (cartError) {
    return (
      <PublicPageShell
        eyebrow={t({ he: 'FYURI / סל', en: 'FYURI / CART' })}
        title={t({ he: 'לא הצלחנו לטעון את הסל.', en: 'We could not load your cart.' })}
        description={t({
          he: 'הפריטים שלכם לא אבדו. בדקו את החיבור ונסו לטעון אותם שוב.',
          en: 'Your saved items have not been discarded. Check your connection and retry.',
        })}
      >
        <Alert
          severity="error"
          className="fy-panel"
          action={(
            <Button color="inherit" size="small" onClick={retryCart}>
              {t({ he: 'נסו שוב', en: 'Retry' })}
            </Button>
          )}
        >
          {t({
            he: 'שירות הסל אינו זמין כרגע.',
            en: 'The cart service is temporarily unavailable.',
          })}
        </Alert>
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
  const stockIssues = cart.filter((item) => {
    const product = products[item.productId] || item.product;
    if (!product) return false;
    const availableStock = Number(product.stockQuantity);
    return !product.inStock
      || !Number.isFinite(availableStock)
      || availableStock <= 0
      || item.quantity > availableStock;
  });

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
      {cartMutationError && (
        <Alert
          severity="error"
          sx={{ mb: 2.5 }}
          role="alert"
          action={failedMutation && (
            <Button
              color="inherit"
              size="small"
              disabled={pendingItemId !== null}
              onClick={() => mutateCart(failedMutation)}
            >
              {t({ he: 'נסו שוב', en: 'Retry' })}
            </Button>
          )}
        >
          {cartMutationError}
        </Alert>
      )}

      {stockIssues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2.5 }} role="alert">
          {t({
            he: 'המלאי השתנה. עדכנו או הסירו את הפריטים המסומנים לפני שתמשיכו.',
            en: 'Stock has changed. Update or remove the flagged items before continuing.',
          })}
        </Alert>
      )}

      <Box className="fy-public-grid">
        <Box className="fy-public-grid__main">
          {cart.map((item) => {
            const product = products[item.productId] || item.product;
            const productName = language === 'he'
              ? (product?.nameHebrew || product?.name)
              : product?.name;
            const stockQuantity = product && Number.isFinite(Number(product.stockQuantity))
              ? Math.max(0, Number(product.stockQuantity))
              : 0;
            const hasStockIssue = Boolean(product)
              && (!product.inStock || stockQuantity === 0 || item.quantity > stockQuantity);
            const mutationPending = pendingItemId === item.id;
            const mutationLocked = pendingItemId !== null;

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
                    {hasStockIssue && (
                      <Typography variant="caption" color="warning.main" role="status">
                        {stockQuantity > 0
                          ? t({
                              he: `נותרו רק ${stockQuantity} יחידות במלאי.`,
                              en: `Only ${stockQuantity} unit(s) are currently available.`,
                            })
                          : t({ he: 'המוצר אזל מהמלאי.', en: 'This product is out of stock.' })}
                      </Typography>
                    )}
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
                        onClick={() => mutateCart({
                          type: 'quantity',
                          itemId: item.id,
                          quantity: item.quantity - 1,
                        })}
                        disabled={item.quantity <= 1 || mutationLocked}
                        aria-label={t({ he: `הפחת כמות של ${productName || ''}`, en: `Decrease quantity of ${productName || 'item'}` })}
                      >
                        <Remove />
                      </IconButton>
                      <Typography sx={{ mx: 1.5, minWidth: 24, textAlign: 'center', fontWeight: 800 }}>
                        {item.quantity}
                      </Typography>
                      {mutationPending && (
                        <CircularProgress
                          size={16}
                          aria-label={t({ he: 'מעדכן סל', en: 'Updating cart' })}
                          sx={{ mx: 0.5 }}
                        />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => mutateCart({
                          type: 'quantity',
                          itemId: item.id,
                          quantity: item.quantity + 1,
                        })}
                        disabled={
                          mutationLocked
                          || !product
                          || !product.inStock
                          || item.quantity >= stockQuantity
                        }
                        aria-label={t({ he: `הגדל כמות של ${productName || ''}`, en: `Increase quantity of ${productName || 'item'}` })}
                      >
                        <Add />
                      </IconButton>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={1} sx={{ textAlign: { xs: 'end', sm: 'center' } }}>
                    <IconButton
                      color="error"
                      onClick={() => mutateCart({ type: 'remove', itemId: item.id })}
                      disabled={mutationLocked}
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
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate('/checkout')}
              disabled={stockIssues.length > 0 || pendingItemId !== null}
            >
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
