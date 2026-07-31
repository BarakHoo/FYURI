import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Email,
  Facebook,
  Instagram,
  LocationOn,
  Phone,
  SendOutlined,
  WhatsApp,
} from '@mui/icons-material';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import PublicPageShell from '../components/PublicPageShell';
import { useLanguage } from '../context/LanguageContext';

function ContactPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const serviceContext = searchParams.get('service');
  const productContext = (searchParams.get('product') || '').trim().slice(0, 120);
  const contextTemplate = productContext
    ? t({
        he: `אני מעוניין/ת לקבל מידע על ${productContext}. השאלה שלי:`,
        en: `I would like expert guidance about ${productContext}. My question is:`,
      })
    : (
      serviceContext === 'lab'
        ? t({
            he: 'אני מעוניין/ת בשירות מעבדה עבור מכשיר ראיית לילה. פרטי המכשיר והתקלה:',
            en: 'I would like to request lab service for a night-vision device. Device and issue details:',
          })
        : ''
    );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [messageTouched, setMessageTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const messageValue = messageTouched ? formData.message : contextTemplate;

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'message') setMessageTouched(true);
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, message: messageValue }),
      });
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setMessageTouched(false);
      } else if (response.status === 429) {
        setStatus('rate-limited');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <PublicPageShell
      eyebrow={t({ he: 'FYURI / קשר', en: 'FYURI / CONTACT' })}
      title={t({ he: 'בואו נתאים את הצעד הבא.', en: 'Let’s define the next step.' })}
      description={t({
        he: 'ספרו לנו אם אתם מחפשים מערכת, רכיבים או שירות מעבדה. נחזור אליכם עם הכוונה עניינית.',
        en: 'Tell us whether you need a system, components or lab service. We will follow up with practical guidance.',
      })}
      actions={(
        <Button
          component="a"
          href="https://wa.me/972544770200"
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          startIcon={<WhatsApp />}
        >
          WhatsApp
        </Button>
      )}
    >
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Paper className="fy-panel" sx={{ p: { xs: 2.5, sm: 3.5 }, textAlign: 'start' }}>
            <span className="fy-section-kicker">{t({ he: 'שליחת הודעה', en: 'Send a message' })}</span>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              {productContext
                ? t({ he: `שאלה על ${productContext}`, en: `Ask about ${productContext}` })
                : (
                  serviceContext === 'lab'
                    ? t({ he: 'בקשת שירות מעבדה', en: 'Lab service request' })
                    : t({ he: 'איך אפשר לעזור?', en: 'How can we help?' })
                )}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate={false}>
              {status === 'success' && (
                <Alert severity="success" sx={{ my: 2 }}>
                  {t({ he: 'ההודעה התקבלה ונשמרה בהצלחה.', en: 'Your message was received and saved successfully.' })}
                </Alert>
              )}
              {status === 'rate-limited' && (
                <Alert severity="warning" sx={{ my: 2 }}>
                  {t({ he: 'נשלחו יותר מדי הודעות. נסו שוב בעוד מספר דקות.', en: 'Too many messages were sent. Please try again in a few minutes.' })}
                </Alert>
              )}
              {status === 'error' && (
                <Alert severity="error" sx={{ my: 2 }}>
                  {t({ he: 'לא הצלחנו לקבל את ההודעה. נסו שוב או צרו קשר טלפונית.', en: 'The message could not be received. Please retry or contact us by phone.' })}
                </Alert>
              )}

              <TextField
                required
                fullWidth
                label={t({ he: 'שם מלא', en: 'Full Name' })}
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                autoComplete="name"
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                required
                fullWidth
                label={t({ he: 'אימייל', en: 'Email' })}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                autoComplete="email"
                inputProps={{ maxLength: 200 }}
              />
              <TextField
                fullWidth
                label={t({ he: 'טלפון', en: 'Phone' })}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                margin="normal"
                autoComplete="tel"
                inputProps={{ maxLength: 30 }}
              />
              <TextField
                required
                fullWidth
                label={t({ he: 'הודעה', en: 'Message' })}
                name="message"
                value={messageValue}
                onChange={handleChange}
                multiline
                rows={7}
                margin="normal"
                inputProps={{ maxLength: 4000 }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={sending}
                startIcon={<SendOutlined />}
                sx={{ mt: 2 }}
              >
                {sending
                  ? t({ he: 'שולח...', en: 'Sending...' })
                  : t({ he: 'שליחת הודעה', en: 'Send message' })}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={2.5}>
            <Paper className="fy-panel" sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <span className="fy-section-kicker">{t({ he: 'פרטי התקשרות', en: 'Contact details' })}</span>
              <Typography component="h2" variant="h5" sx={{ fontWeight: 800, mb: 2.5, textAlign: 'start' }}>
                {t({ he: 'דברו ישירות עם הצוות.', en: 'Talk directly with the team.' })}
              </Typography>

              <Box component="ul" className="fy-info-list">
                <Box component="li" className="fy-info-row">
                  <Box className="fy-info-icon"><Phone /></Box>
                  <Box>
                    <Typography variant="caption" className="fy-muted">{t({ he: 'טלפון', en: 'Phone' })}</Typography>
                    <Link href="tel:+972544770200" underline="hover" color="inherit" display="block">
                      054-477-0200
                    </Link>
                  </Box>
                </Box>
                <Box component="li" className="fy-info-row">
                  <Box className="fy-info-icon"><Email /></Box>
                  <Box>
                    <Typography variant="caption" className="fy-muted">{t({ he: 'אימייל', en: 'Email' })}</Typography>
                    <Link href="mailto:info@fyuri.co.il" underline="hover" color="inherit" display="block">
                      info@fyuri.co.il
                    </Link>
                  </Box>
                </Box>
                <Box component="li" className="fy-info-row">
                  <Box className="fy-info-icon"><LocationOn /></Box>
                  <Box>
                    <Typography variant="caption" className="fy-muted">{t({ he: 'כתובת', en: 'Location' })}</Typography>
                    <Typography>{t({ he: 'רחובות, ישראל', en: 'Rehovot, Israel' })}</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            <Paper className="fy-panel" sx={{ p: 3, textAlign: 'start' }}>
              <span className="fy-section-kicker">{t({ he: 'שעות פעילות', en: 'Business hours' })}</span>
              <Typography>{t({ he: 'ראשון–חמישי: 9:00–17:00', en: 'Sunday–Thursday: 9:00 AM–5:00 PM' })}</Typography>
              <Typography>{t({ he: 'שישי: 9:00–13:00', en: 'Friday: 9:00 AM–1:00 PM' })}</Typography>
              <Typography className="fy-muted">{t({ he: 'שבת: סגור', en: 'Saturday: Closed' })}</Typography>
            </Paper>

            <Paper className="fy-panel" sx={{ p: 2.5, textAlign: 'start' }}>
              <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                {t({ he: 'עקבו אחרינו', en: 'Follow FYURI' })}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Facebook">
                  <IconButton
                    component="a"
                    href="https://www.facebook.com/FYURINV"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    sx={{ border: '1px solid #26404f' }}
                  >
                    <Facebook />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Instagram">
                  <IconButton
                    component="a"
                    href="https://www.instagram.com/fyuri.night.vision/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    sx={{ border: '1px solid #26404f' }}
                  >
                    <Instagram />
                  </IconButton>
                </Tooltip>
                <Tooltip title="WhatsApp">
                  <IconButton
                    component="a"
                    href="https://wa.me/972544770200"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    sx={{ border: '1px solid #26404f' }}
                  >
                    <WhatsApp />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </PublicPageShell>
  );
}

export default ContactPage;
