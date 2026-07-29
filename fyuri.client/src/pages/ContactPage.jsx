import { Typography, Box, Paper, TextField, Button, Grid, IconButton, Tooltip, Alert } from '@mui/material';
import { Phone, Email, LocationOn, WhatsApp, Facebook, Instagram } from '@mui/icons-material';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | 'rate-limited'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
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
    <Box sx={{ }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'left' }}>
        {t({ he: 'צור קשר', en: 'Contact Us' })}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'left' }}>
              {t({ he: 'שלח לנו הודעה', en: 'Send Us a Message' })}
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              {status === 'success' && (
                <Alert severity="success" sx={{ mb: 1 }}>
                  {t({ he: 'הודעתך נשלחה בהצלחה!', en: 'Your message has been sent successfully!' })}
                </Alert>
              )}
              {status === 'rate-limited' && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  {t({ he: 'נשלחו יותר מדי הודעות. נסה שוב בעוד מספר דקות.', en: 'Too many messages sent. Please try again in a few minutes.' })}
                </Alert>
              )}
              {status === 'error' && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {t({ he: 'שליחת ההודעה נכשלה. אנא נסה שוב או צור קשר טלפונית.', en: 'Failed to send the message. Please try again or contact us by phone.' })}
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
              />
              <TextField
                fullWidth
                label={t({ he: 'טלפון', en: 'Phone' })}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                required
                fullWidth
                label={t({ he: 'הודעה', en: 'Message' })}
                name="message"
                value={formData.message}
                onChange={handleChange}
                multiline
                rows={6}
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={sending}
                sx={{ mt: 2 }}
              >
                {sending
                  ? t({ he: 'שולח...', en: 'Sending...' })
                  : t({ he: 'שלח הודעה', en: 'Send Message' })}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'left' }}>
              {t({ he: 'פרטי התקשרות', en: 'Contact Information' })}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <Phone sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t({ he: 'טלפון', en: 'Phone' })}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>054-477-0200</Typography>
              </Box>
              <Tooltip title={t({ he: 'שלח הודעה בוואטסאפ', en: 'Message on WhatsApp' })}>
                <IconButton
                  href="https://wa.me/972544770200"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#25D366',
                      borderColor: '#25D366',
                      bgcolor: 'rgba(37, 211, 102, 0.08)',
                    },
                  }}
                >
                  <WhatsApp fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <Email sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t({ he: 'אימייל', en: 'Email' })}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>info@fyuri.co.il</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocationOn sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t({ he: 'כתובת', en: 'Address' })}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{t({ he: 'רחובות, ישראל', en: 'Rehovot, Israel' })}</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, textAlign: 'left' }}>
              {t({ he: 'עקוב אחרינו', en: 'Follow Us' })}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Tooltip title="Facebook">
                <IconButton
                  href="https://www.facebook.com/FYURINV"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    p: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#1877f2',
                      borderColor: '#1877f2',
                      bgcolor: 'rgba(24, 119, 242, 0.08)',
                    },
                  }}
                >
                  <Facebook />
                </IconButton>
              </Tooltip>
              <Tooltip title="Instagram">
                <IconButton
                  href="https://www.instagram.com/fyuri.night.vision/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    p: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#e6683c',
                      borderColor: '#e6683c',
                      bgcolor: 'rgba(230, 104, 60, 0.08)',
                    },
                  }}
                >
                  <Instagram />
                </IconButton>
              </Tooltip>
              <Tooltip title="WhatsApp">
                <IconButton
                  href="https://wa.me/972544770200"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    p: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#25D366',
                      borderColor: '#25D366',
                      bgcolor: 'rgba(37, 211, 102, 0.08)',
                    },
                  }}
                >
                  <WhatsApp />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
              {t({ he: 'שעות פעילות', en: 'Business Hours' })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
              {t({ he: 'ראשון - חמישי: 9:00 - 17:00', en: 'Sunday - Thursday: 9:00 AM - 5:00 PM' })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
              {t({ he: 'שישי: 9:00 - 13:00', en: 'Friday: 9:00 AM - 1:00 PM' })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
              {t({ he: 'שבת: סגור', en: 'Saturday: Closed' })}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ContactPage;
