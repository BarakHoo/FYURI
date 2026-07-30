import { Typography, Box, Paper, Button, IconButton, Grid } from '@mui/material';
import { Delete, Add, Remove, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState } from 'react';

function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { language, t } = useLanguage();
  const [products, setProducts] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [cart]);

  const fetchProducts = async () => {
    const productMap = {};
    for (const item of cart) {
      if (!productMap[item.productId]) {
        try {
          const response = await fetch(`/api/products/${item.productId}`);
          if (response.ok) {
            const product = await response.json();
            productMap[item.productId] = product;
          }
        } catch (error) {
          console.error('Failed to fetch product:', error);
        }
      }
    }
    setProducts(productMap);
  };

  if (cart.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          {t({ he: 'הסל שלך ריק', en: 'Your cart is empty' })}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          {t({ he: 'המשך לקטלוג', en: 'Continue Shopping' })}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        {t({ he: 'סל קניות', en: 'Shopping Cart' })}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cart.map((item) => {
            const product = products[item.productId];
            return (
              <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6">
                      {language === 'he'
                        ? (product?.nameHebrew || product?.name || t({ he: 'טוען...', en: 'Loading...' }))
                        : (product?.name || t({ he: 'טוען...', en: 'Loading...' }))
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product?.sku}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Typography variant="body1">
                      ₪{item.priceAtAddTime.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      color="error"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              position: 'sticky',
              top: 'calc(var(--site-header-height) + 16px)',
              transition: (theme) => theme.transitions.create(
                'top',
                { duration: theme.transitions.duration.shorter },
              ),
            }}
          >
            <Typography variant="h5" gutterBottom>
              {t({ he: 'סיכום הזמנה', en: 'Order Summary' })}
            </Typography>
            <Box sx={{ my: 2 }}>
              <Grid container>
                <Grid item xs={6}>
                  <Typography>{t({ he: 'סה"כ פריטים:', en: 'Total Items:' })}</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'left' }}>
                  <Typography>{cart.reduce((sum, item) => sum + item.quantity, 0)}</Typography>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ my: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Grid container>
                <Grid item xs={6}>
                  <Typography variant="h6">{t({ he: 'סה"כ:', en: 'Total:' })}</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" color="primary">
                    ₪{getCartTotal().toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate('/checkout')}
            >
              {t({ he: 'השאר פרטים ליצירת קשר', en: 'Submit Details for Contact' })}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CartPage;
