import { useParams, Link as RouterLink } from 'react-router';
import { Typography, Box, Paper, Button, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, CircularProgress } from '@mui/material';
import { CheckCircle, ContactSupportOutlined, WhatsApp } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';
import PublicPageShell from '../components/PublicPageShell';

function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const { t, language } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderNumber}`);
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) setOrder(data);
        } else if (!cancelled) {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrderDetails();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <PublicPageShell
        eyebrow={t({ he: 'FYURI / הזמנה', en: 'FYURI / ORDER' })}
        title={t({ he: 'טוען את פרטי הבקשה…', en: 'Loading your request…' })}
      >
        <Box className="fy-panel fy-public-empty">
          <CircularProgress aria-label={t({ he: 'טוען הזמנה', en: 'Loading order' })} />
        </Box>
      </PublicPageShell>
    );
  }

  if (error || !order) {
    return (
      <PublicPageShell
        eyebrow={t({ he: 'FYURI / הזמנה', en: 'FYURI / ORDER' })}
        title={t({ he: 'לא מצאנו את הבקשה.', en: 'We could not find this request.' })}
        description={t({
          he: 'בדקו שמספר ההזמנה בקישור מלא, או צרו איתנו קשר ונשמח לעזור.',
          en: 'Check that the complete order number is present in the link, or contact us for help.',
        })}
        actions={(
          <>
            <Button variant="contained" component={RouterLink} to="/">
              {t({ he: 'חזרה לדף הבית', en: 'Back to home' })}
            </Button>
            <Button variant="outlined" component={RouterLink} to="/contact">
              {t({ he: 'צור קשר', en: 'Contact us' })}
            </Button>
          </>
        )}
      >
        <Alert severity="warning" className="fy-panel">
          {t({
            he: 'ההזמנה אינה זמינה בקישור הזה.',
            en: 'The order is not available at this link.',
          })}
        </Alert>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell
      eyebrow={t({ he: 'FYURI / בקשה התקבלה', en: 'FYURI / REQUEST RECEIVED' })}
      title={t({ he: 'בקשת ההזמנה התקבלה.', en: 'Your order request was received.' })}
      description={t({
        he: `מספר ההזמנה שלך: ${orderNumber}`,
        en: `Your order number: ${orderNumber}`,
      })}
    >
    <Box sx={{ maxWidth: 980, mx: 'auto' }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography component="h2" variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
          {t({ he: 'הפרטים נשמרו בהצלחה.', en: 'Your details were saved successfully.' })}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t({ he: `מספר הזמנה: ${orderNumber}`, en: `Order Number: ${orderNumber}` })}
        </Typography>
      </Box>

      {/* Main Confirmation Message */}
      <Alert severity="success" sx={{ mb: 3, textAlign: 'start' }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {t({ 
            he: 'תודה רבה. בקשת ההזמנה שלך נקלטה במערכת.',
            en: 'Thank you. Your order request has been recorded.'
          })}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {t({ 
            he: 'נציג שלנו יצור איתך קשר בהקדם האפשרי במהלך שעות הפעילות שלנו. נשמח לענות על כל שאלה!',
            en: 'Our representative will contact you as soon as possible during our business hours. We\'ll be happy to answer any questions!'
          })}
        </Typography>
      </Alert>

      {/* Business Hours Info */}
      <Paper className="fy-panel" sx={{ p: 3, mb: 3, textAlign: 'start' }}>
        <Typography variant="h6" gutterBottom color="primary">
          {t({ he: 'שעות הפעילות שלנו', en: 'Our Business Hours' })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t({ he: 'ראשון - חמישי: 9:00 - 17:00', en: 'Sunday - Thursday: 9:00 AM - 5:00 PM' })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t({ he: 'שישי: 9:00 - 13:00', en: 'Friday: 9:00 AM - 1:00 PM' })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t({ he: 'שבת: סגור', en: 'Saturday: Closed' })}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }} color="primary.main">
          {t({ he: 'טלפון: 054-477-0200', en: 'Phone: 054-477-0200' })}
        </Typography>
      </Paper>

      {/* Order Summary */}
      <Paper className="fy-panel" sx={{ p: { xs: 2, sm: 3 }, mb: 3, textAlign: 'start' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {t({ he: 'סיכום הזמנה', en: 'Order Summary' })}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Customer Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            {t({ he: 'פרטי לקוח', en: 'Customer Information' })}
          </Typography>
          <Typography variant="body2"><strong>{t({ he: 'שם:', en: 'Name:' })}</strong> {order.customerName}</Typography>
          <Typography variant="body2"><strong>{t({ he: 'אימייל:', en: 'Email:' })}</strong> {order.customerEmail}</Typography>
          <Typography variant="body2"><strong>{t({ he: 'טלפון:', en: 'Phone:' })}</strong> {order.customerPhone}</Typography>
          {order.customerAddress && (
            <Typography variant="body2"><strong>{t({ he: 'כתובת:', en: 'Address:' })}</strong> {order.customerAddress}</Typography>
          )}
          {order.customerCity && (
            <Typography variant="body2"><strong>{t({ he: 'עיר:', en: 'City:' })}</strong> {order.customerCity}</Typography>
          )}
          {order.customerNotes && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>{t({ he: 'הערות:', en: 'Notes:' })}</strong> {order.customerNotes}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Order Items */}
        <Typography variant="h6" gutterBottom color="primary">
          {t({ he: 'פריטים בהזמנה', en: 'Order Items' })}
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>{t({ he: 'מוצר', en: 'Product' })}</strong></TableCell>
                <TableCell align="right"><strong>{t({ he: 'כמות', en: 'Quantity' })}</strong></TableCell>
                <TableCell align="right"><strong>{t({ he: 'מחיר יחידה', en: 'Unit Price' })}</strong></TableCell>
                <TableCell align="right"><strong>{t({ he: 'סה"כ', en: 'Total' })}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2">{item.productName}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.productSku}</Typography>
                    {item.product?.productType === 'custom-build' &&
                      (language === 'he' ? item.product?.descriptionHebrew : item.product?.description) && (
                        <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                          {(language === 'he' ? item.product.descriptionHebrew : item.product.description)
                            .split('; ')
                            .map((line, i) => (
                              <Typography
                                key={i}
                                component="li"
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'list-item' }}
                              >
                                {line}
                              </Typography>
                            ))}
                        </Box>
                      )}
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">₪{item.unitPrice.toLocaleString()}</TableCell>
                  <TableCell align="right">₪{item.totalPrice.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t({ he: 'סה"כ:', en: 'Total:' })}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    ₪{order.totalAmount.toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Next Steps */}
      <Alert severity="info" sx={{ mb: 3, textAlign: 'start' }}>
        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
          {t({ he: 'מה הלאה?', en: 'What\'s Next?' })}
        </Typography>
        <Typography variant="body2">
          {t({ 
            he: '1. שמרו את מספר ההזמנה המופיע בראש הדף',
            en: '1. Keep the order number shown at the top of this page'
          })}
        </Typography>
        <Typography variant="body2">
          {t({ 
            he: '2. נציג שירות מטעמנו יצור איתך קשר בקרוב (בדרך כלל תוך 24 שעות)',
            en: '2. Our service representative will contact you soon (usually within 24 hours)'
          })}
        </Typography>
        <Typography variant="body2">
          {t({ 
            he: '3. נאמת את ההזמנה ונתאם מועד אספקה',
            en: '3. We will verify your order and arrange a delivery date'
          })}
        </Typography>
        <Typography variant="body2">
          {t({ 
            he: '4. נשמח לענות על כל שאלה ולעזור לך לבחור את הציוד המושלם',
            en: '4. We\'ll be happy to answer any questions and help you choose the perfect equipment'
          })}
        </Typography>
      </Alert>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" component={RouterLink} to="/products" size="large">
          {t({ he: 'המשך לקטלוג', en: 'Continue Shopping' })}
        </Button>
        <Button variant="outlined" component={RouterLink} to="/" size="large">
          {t({ he: 'חזור לדף הבית', en: 'Back to Home' })}
        </Button>
        <Button
          variant="outlined"
          component="a"
          href={`https://wa.me/972544770200?text=${encodeURIComponent(`FYURI order ${orderNumber}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          size="large"
          startIcon={<WhatsApp />}
        >
          WhatsApp
        </Button>
        <Button variant="outlined" component={RouterLink} to="/contact" size="large" startIcon={<ContactSupportOutlined />}>
          {t({ he: 'צור קשר', en: 'Contact us' })}
        </Button>
      </Box>
    </Box>
    </PublicPageShell>
  );
}

export default OrderConfirmationPage;
