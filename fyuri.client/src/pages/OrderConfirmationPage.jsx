import { useParams, Link as RouterLink } from 'react-router';
import { Typography, Box, Paper, Button, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, CircularProgress } from '@mui/material';
import {
  BuildOutlined,
  CheckCircle,
  ContactSupportOutlined,
  FactCheckOutlined,
  Inventory2Outlined,
  SupportAgentOutlined,
  WhatsApp,
} from '@mui/icons-material';
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
      heroImage="/images/banners/catalog-night-ops.webp"
      actions={(
        <Button
          component="a"
          href={`https://wa.me/972544770200?text=${encodeURIComponent(`FYURI order ${orderNumber}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          startIcon={<WhatsApp />}
        >
          WhatsApp
        </Button>
      )}
    >
      <Box sx={{ maxWidth: 1120, mx: 'auto' }}>
        <Paper
          className="fy-panel"
          sx={{
            p: { xs: 2.5, md: 3.5 },
            mb: 2.5,
            display: 'grid',
            gridTemplateColumns: { xs: '58px minmax(0, 1fr)', md: '72px minmax(0, 1fr) auto' },
            alignItems: 'center',
            gap: 2,
            textAlign: 'start',
          }}
        >
          <CheckCircle sx={{ fontSize: { xs: 48, md: 64 }, color: '#42baf2' }} />
          <Box>
            <span className="fy-section-kicker">
              {t({ he: 'סטטוס בקשה', en: 'Request status' })}
            </span>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 850 }}>
              {t({ he: 'הפרטים נשמרו במערכת.', en: 'Your details were recorded.' })}
            </Typography>
            <Typography className="fy-muted" sx={{ mt: 0.6 }}>
              {t({
                he: 'הצוות יעבור על המערכות והרכיבים ויצור קשר להשלמת הפרטים.',
                en: 'The team will review the systems and components and contact you to finalize the details.',
              })}
            </Typography>
          </Box>
          <Box
            sx={{
              gridColumn: { xs: '1 / -1', md: 'auto' },
              minWidth: 220,
              p: 1.75,
              color: '#42baf2',
              bgcolor: '#06131c',
              border: '1px solid #1b394a',
              borderRadius: 1,
              fontFamily: 'var(--mono)',
              fontSize: '0.72rem',
              overflowWrap: 'anywhere',
            }}
          >
            <Typography component="span" sx={{ display: 'block', color: '#8296a2', fontSize: '0.62rem' }}>
              {t({ he: 'מספר בקשה', en: 'REQUEST NUMBER' })}
            </Typography>
            {orderNumber}
          </Box>
        </Paper>

        <Box className="fy-process-rail" sx={{ mb: 2.5 }}>
          {[
            {
              icon: FactCheckOutlined,
              title: t({ he: 'הבקשה נרשמה', en: 'Request recorded' }),
              body: t({ he: 'הפרטים והפריטים נשמרו.', en: 'Your details and items were saved.' }),
            },
            {
              icon: Inventory2Outlined,
              title: t({ he: 'בדיקת התצורה', en: 'Configuration review' }),
              body: t({ he: 'הצוות יבדוק מלאי ותאימות.', en: 'The team will review availability and compatibility.' }),
            },
            {
              icon: SupportAgentOutlined,
              title: t({ he: 'השלמה מול הצוות', en: 'Finalize with the team' }),
              body: t({ he: 'ניצור קשר לאישור הפרטים.', en: 'We will contact you to confirm the details.' }),
            },
            {
              icon: ContactSupportOutlined,
              title: t({ he: 'שאלות ותמיכה', en: 'Questions & support' }),
              body: t({ he: 'ציינו את מספר הבקשה בכל פנייה.', en: 'Reference the request number when contacting us.' }),
            },
          ].map((step, index) => {
            const StepIcon = step.icon;
            return (
              <Box className="fy-process-step" key={step.title}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <StepIcon sx={{ mt: 1.4, color: '#42baf2' }} aria-hidden="true" />
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </Box>
            );
          })}
        </Box>

        <Paper className="fy-panel" sx={{ p: { xs: 2, sm: 3 }, mb: 3, textAlign: 'start' }}>
          <span className="fy-section-kicker">{t({ he: 'פרטי הבקשה', en: 'Request details' })}</span>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
            {t({ he: 'סיכום הזמנה', en: 'Order Summary' })}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box className="fy-metric-grid" sx={{ mb: 3 }}>
            <Box className="fy-metric">
              <strong>{order.customerName}</strong>
              <span>{t({ he: 'איש קשר', en: 'Contact name' })}</span>
            </Box>
            <Box className="fy-metric">
              <strong>{order.customerEmail}</strong>
              <span>{t({ he: 'אימייל', en: 'Email' })}</span>
            </Box>
            <Box className="fy-metric">
              <strong>{order.customerPhone}</strong>
              <span>{t({ he: 'טלפון', en: 'Phone' })}</span>
            </Box>
            <Box className="fy-metric">
              <strong>{order.customerCity || '—'}</strong>
              <span>{t({ he: 'עיר', en: 'City' })}</span>
            </Box>
          </Box>

          {(order.customerAddress || order.customerNotes) && (
            <Alert severity="info" sx={{ mb: 2.5 }}>
              {order.customerAddress && (
                <Typography variant="body2">
                  <strong>{t({ he: 'כתובת:', en: 'Address:' })}</strong> {order.customerAddress}
                </Typography>
              )}
              {order.customerNotes && (
                <Typography variant="body2" sx={{ mt: order.customerAddress ? 0.7 : 0 }}>
                  <strong>{t({ he: 'הערות:', en: 'Notes:' })}</strong> {order.customerNotes}
                </Typography>
              )}
            </Alert>
          )}

          <Typography variant="h6" gutterBottom sx={{ color: '#42baf2', fontWeight: 800 }}>
            {t({ he: 'פריטים בבקשה', en: 'Request Items' })}
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{t({ he: 'מוצר', en: 'Product' })}</strong></TableCell>
                  <TableCell align="right"><strong>{t({ he: 'כמות', en: 'Quantity' })}</strong></TableCell>
                  <TableCell align="right"><strong>{t({ he: 'מחיר יחידה', en: 'Unit Price' })}</strong></TableCell>
                  <TableCell align="right"><strong>{t({ he: 'סה״כ', en: 'Total' })}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={`${item.productId || item.productSku}-${item.quantity}`}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 750 }}>{item.productName}</Typography>
                      <Typography variant="caption" className="fy-muted">{item.productSku}</Typography>
                      {item.product?.productType === 'custom-build'
                        && (language === 'he' ? item.product?.descriptionHebrew : item.product?.description)
                        && (
                          <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                            {(language === 'he' ? item.product.descriptionHebrew : item.product.description)
                              .split('; ')
                              .map((line) => (
                                <Typography
                                  key={line}
                                  component="li"
                                  variant="caption"
                                  className="fy-muted"
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
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {t({ he: 'סה״כ:', en: 'Total:' })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" sx={{ color: '#42baf2', fontWeight: 800 }}>
                      ₪{order.totalAmount.toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box className="fy-route-cta">
          <Box className="fy-route-cta__copy">
            <span className="fy-section-kicker">{t({ he: 'המשך הדרך', en: 'Continue' })}</span>
            <h2>{t({ he: 'שמרו את מספר הבקשה לשיחה עם הצוות.', en: 'Keep the request number for your conversation with the team.' })}</h2>
            <p>{t({ he: 'אפשר להמשיך לקטלוג, לפתוח תצורה נוספת או לפנות אלינו בשאלה.', en: 'Continue to the catalog, start another configuration, or contact us with a question.' })}</p>
          </Box>
          <Box className="fy-route-cta__actions">
            <Button variant="contained" component={RouterLink} to="/products" startIcon={<Inventory2Outlined />}>
              {t({ he: 'לקטלוג', en: 'Catalog' })}
            </Button>
            <Button variant="outlined" component={RouterLink} to="/builder" startIcon={<BuildOutlined />}>
              {t({ he: 'בונה מכשירים', en: 'Device builder' })}
            </Button>
            <Button variant="outlined" component={RouterLink} to="/contact" startIcon={<ContactSupportOutlined />}>
              {t({ he: 'צור קשר', en: 'Contact us' })}
            </Button>
          </Box>
        </Box>
      </Box>
    </PublicPageShell>
  );
}

export default OrderConfirmationPage;
