import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import PublicPageShell from '../components/PublicPageShell';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { language, t } = useLanguage();
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    customerNotes: '',
  });

  const [formErrors, setFormErrors] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
  });

  useEffect(() => {
    let cancelled = false;

    if (cart.length === 0 && !orderSubmitted) {
      navigate('/cart');
      return undefined;
    }

    if (cart.length > 0) {
      const loadProducts = async () => {
        const productMap = {};
        for (const item of cart) {
          try {
            const response = await fetch(`/api/products/${item.productId}`);
            if (response.ok) {
              productMap[item.productId] = await response.json();
            }
          } catch (error) {
            console.error('Failed to fetch product:', error);
          }
        }
        if (!cancelled) setProducts(productMap);
      };

      loadProducts();
    }

    return () => {
      cancelled = true;
    };
  }, [cart, navigate, orderSubmitted]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'customerName':
        if (!value.trim()) {
          error = t({ he: 'שם הוא שדה חובה', en: 'Name is required' });
        } else if (value.trim().length < 2) {
          error = t({ he: 'שם חייב להכיל לפחות 2 תווים', en: 'Name must be at least 2 characters' });
        } else if (/\d/.test(value)) {
          error = t({ he: 'שם לא יכול להכיל מספרים', en: 'Name cannot contain numbers' });
        } else if (!/^[a-zA-Z\u0590-\u05FF\s'-]+$/.test(value)) {
          error = t({ he: 'שם יכול להכיל רק אותיות, רווחים, מקפים ומירכאות', en: 'Name can only contain letters, spaces, hyphens and apostrophes' });
        }
        break;

      case 'customerEmail':
        if (!value.trim()) {
          error = t({ he: 'אימייל הוא שדה חובה', en: 'Email is required' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = t({ he: 'נא להזין כתובת אימייל תקינה', en: 'Please enter a valid email address' });
        }
        break;

      case 'customerPhone':
        if (!value.trim()) {
          error = t({ he: 'טלפון הוא שדה חובה', en: 'Phone is required' });
        } else if (!/^\+?[\d\s\-()]+$/.test(value)) {
          error = t({ he: 'טלפון יכול להכיל רק מספרים, רווחים, מקפים וסוגריים', en: 'Phone can only contain numbers, spaces, hyphens and parentheses' });
        } else {
          const digitsOnly = value.replace(/\D/g, '');
          if (digitsOnly.length < 9) {
            error = t({ he: 'טלפון חייב להכיל לפחות 9 ספרות', en: 'Phone must contain at least 9 digits' });
          } else if (digitsOnly.length > 15) {
            error = t({ he: 'טלפון לא יכול להכיל יותר מ-15 ספרות', en: 'Phone cannot contain more than 15 digits' });
          }
        }
        break;

      case 'customerAddress':
        if (value.trim() && value.trim().length < 5) {
          error = t({ he: 'כתובת חייבת להכיל לפחות 5 תווים', en: 'Address must be at least 5 characters' });
        }
        break;

      case 'customerCity':
        if (value.trim() && /\d/.test(value)) {
          error = t({ he: 'שם עיר לא יכול להכיל מספרים', en: 'City name cannot contain numbers' });
        } else if (value.trim() && !/^[a-zA-Z\u0590-\u05FF\s'-]+$/.test(value)) {
          error = t({ he: 'שם עיר יכול להכיל רק אותיות, רווחים ומקפים', en: 'City name can only contain letters, spaces and hyphens' });
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate on change
    const error = validateField(name, value);
    setFormErrors({
      ...formErrors,
      [name]: error,
    });
  };

  const validateForm = () => {
    const errors = {
      customerName: validateField('customerName', formData.customerName),
      customerEmail: validateField('customerEmail', formData.customerEmail),
      customerPhone: validateField('customerPhone', formData.customerPhone),
      customerAddress: validateField('customerAddress', formData.customerAddress),
      customerCity: validateField('customerCity', formData.customerCity),
    };

    setFormErrors(errors);

    // Return true if no errors
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      setError(t({
        he: 'אנא תקן את השגיאות בטופס לפני המשך',
        en: 'Please fix the errors in the form before continuing'
      }));
      return;
    }

    try {
      const orderData = {
        ...formData,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        setOrderSubmitted(true);
        await clearCart();
        navigate(`/order-confirmation/${order.orderNumber}`);
      } else {
        setError(t({
          he: 'אירעה שגיאה בשליחת ההזמנה. אנא נסה שנית.',
          en: 'An error occurred while submitting your order. Please try again.'
        }));
      }
    } catch (err) {
      setError(t({
        he: 'אירעה שגיאה בשליחת ההזמנה. אנא נסה שנית.',
        en: 'An error occurred while submitting your order. Please try again.'
      }));
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicPageShell
      eyebrow={t({ he: 'FYURI / פרטי הזמנה', en: 'FYURI / ORDER DETAILS' })}
      title={t({ he: 'השאירו פרטים להשלמת ההזמנה.', en: 'Leave your details to finalize the order.' })}
      description={t({
        he: 'לא מתבצע תשלום באתר. לאחר שליחת הבקשה נציג יחזור אליכם לאימות המפרט, המחיר והמשלוח.',
        en: 'No payment is processed online. After submission, our team will verify the configuration, price and delivery with you.',
      })}
    >

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3, textAlign: 'start' }}>
        {t({
          he: 'שימו לב: תשלום לא מתבצע באתר. נציג שלנו יצור איתכם קשר לסיום ההזמנה ותיאום משלוח. נשמח לענות על כל שאלה ולעזור לכם לבחור את הציוד המושלם.',
          en: 'Note: No payment is processed on the website. Our representative will contact you to finalize your order and arrange delivery. We\'re happy to answer any questions and help you choose the perfect equipment.'
        })}
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper className="fy-panel" sx={{ p: { xs: 2.5, sm: 3.5 }, textAlign: 'start' }}>
            <span className="fy-section-kicker">{t({ he: 'פרטי קשר', en: 'Contact details' })}</span>
            <Typography component="h2" variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
              {t({ he: 'פרטי הלקוח', en: 'Customer Information' })}
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                required
                fullWidth
                label={t({ he: 'שם מלא', en: 'Full Name' })}
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                margin="normal"
                error={!!formErrors.customerName}
                helperText={formErrors.customerName}
                autoComplete="name"
                inputProps={{ maxLength: 200 }}
              />
              <TextField
                required
                fullWidth
                label={t({ he: 'אימייל', en: 'Email' })}
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleChange}
                margin="normal"
                error={!!formErrors.customerEmail}
                helperText={formErrors.customerEmail}
                autoComplete="email"
                inputProps={{ maxLength: 200 }}
              />
              <TextField
                required
                fullWidth
                label={t({ he: 'טלפון', en: 'Phone' })}
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                margin="normal"
                error={!!formErrors.customerPhone}
                helperText={formErrors.customerPhone}
                placeholder={t({ he: '050-1234567', en: '050-1234567' })}
                autoComplete="tel"
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                fullWidth
                label={t({ he: 'כתובת', en: 'Address' })}
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                margin="normal"
                error={!!formErrors.customerAddress}
                helperText={formErrors.customerAddress}
                autoComplete="street-address"
                inputProps={{ maxLength: 500 }}
              />
              <TextField
                fullWidth
                label={t({ he: 'עיר', en: 'City' })}
                name="customerCity"
                value={formData.customerCity}
                onChange={handleChange}
                margin="normal"
                error={!!formErrors.customerCity}
                helperText={formErrors.customerCity}
                autoComplete="address-level2"
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                fullWidth
                label={t({ he: 'הערות', en: 'Notes' })}
                name="customerNotes"
                value={formData.customerNotes}
                onChange={handleChange}
                multiline
                rows={4}
                margin="normal"
                inputProps={{ maxLength: 2000 }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading 
                  ? t({ he: 'שולח...', en: 'Submitting...' })
                  : t({ he: 'שלח בקשת הזמנה', en: 'Submit Order Request' })
                }
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            className="fy-panel fy-sticky-summary"
            sx={{
              p: 3,
              textAlign: 'start',
            }}
          >
            <span className="fy-section-kicker">{t({ he: 'סיכום', en: 'Summary' })}</span>
            <Typography component="h2" variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
              {t({ he: 'סיכום הזמנה', en: 'Order Summary' })}
            </Typography>
            <Box sx={{ my: 2 }}>
              {cart.map((item) => {
                const product = products[item.productId];
                return (
                  <Box key={item.id} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {language === 'he'
                        ? (product?.nameHebrew || product?.name)
                        : product?.name} ×{item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₪{(item.priceAtAddTime * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Grid container>
                <Grid item xs={6}>
                  <Typography variant="h6">
                    {t({ he: 'סה"כ:', en: 'Total:' })}
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" color="primary">
                    ₪{getCartTotal().toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </PublicPageShell>
  );
}

export default CheckoutPage;
