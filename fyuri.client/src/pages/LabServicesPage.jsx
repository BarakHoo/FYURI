import {
  Box,
  Button,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Build,
  ContactSupportOutlined,
  Email,
  Phone,
  Settings,
  Visibility,
  WhatsApp,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import PublicPageShell from '../components/PublicPageShell';
import { useLanguage } from '../context/LanguageContext';

function LabServicesPage() {
  const { t, language } = useLanguage();

  const services = [
    {
      titleHe: 'תחזוקה ואחזקה',
      titleEn: 'Maintenance & Care',
      descriptionHe: 'ניקוי, איטום ותחזוקה שוטפת למכשירי ראיית לילה.',
      descriptionEn: 'Cleaning, sealing and ongoing maintenance for night-vision devices.',
      icon: Build,
    },
    {
      titleHe: 'כיול ובדיקה',
      titleEn: 'Calibration & Testing',
      descriptionHe: 'כיול אופטי מדויק ובדיקות תקינות ואיכות קפדניות.',
      descriptionEn: 'Precise optical calibration plus rigorous function and quality testing.',
      icon: Settings,
    },
    {
      titleHe: 'תיקונים ושדרוגים',
      titleEn: 'Repairs & Upgrades',
      descriptionHe: 'איתור תקלות, החלפת רכיבים ושדרוג מערכות קיימות.',
      descriptionEn: 'Fault diagnosis, component replacement and upgrades for existing systems.',
      icon: Visibility,
    },
  ];

  const serviceItems = [
    { he: 'בדיקות תקינות מקיפות', en: 'Comprehensive functionality tests' },
    { he: 'כיול אופטי מדויק', en: 'Precise optical calibration' },
    { he: 'החלפת מגברי אור', en: 'Image intensifier replacement' },
    { he: 'תיקון מערכות אלקטרוניות', en: 'Electronic-system repair' },
    { he: 'ניקוי ואיטום', en: 'Cleaning and sealing' },
    { he: 'שדרוגים והתאמות', en: 'Upgrades and modifications' },
    { he: 'בדיקות נזקים', en: 'Damage assessment' },
    { he: 'הערכת שווי', en: 'Valuation' },
  ];

  return (
    <PublicPageShell
      eyebrow={t({ he: 'FYURI / מעבדה', en: 'FYURI / LAB' })}
      title={t({ he: 'בדיקה, כיול ותיקון ברמת מערכת.', en: 'Testing, calibration and repair at system level.' })}
      description={t({
        he: 'מעבדה מקצועית למערכות ראיית לילה — מאבחון ראשוני ועד טיפול ברכיבים, איטום וכיול.',
        en: 'Professional support for night-vision systems—from initial diagnosis to component work, sealing and calibration.',
      })}
      actions={(
        <>
          <Button
            component={RouterLink}
            to="/contact?service=lab"
            variant="contained"
            startIcon={<ContactSupportOutlined />}
          >
            {t({ he: 'פתיחת בקשת שירות', en: 'Request lab service' })}
          </Button>
          <Button
            component="a"
            href="https://wa.me/972544770200?text=I%20need%20FYURI%20lab%20service"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<WhatsApp />}
          >
            WhatsApp
          </Button>
        </>
      )}
    >
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {services.map((service, index) => {
          const ServiceIcon = service.icon;
          return (
            <Grid item xs={12} md={4} key={service.titleEn}>
              <Paper className="fy-panel fy-panel--interactive fy-service-card">
                <Box className="fy-service-card__icon">
                  <ServiceIcon sx={{ fontSize: 30 }} />
                </Box>
                <Typography sx={{ color: '#42baf2', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: '0.7rem' }}>
                  {String(index + 1).padStart(2, '0')}
                </Typography>
                <Typography component="h2" variant="h6" sx={{ mt: 0.7, mb: 1, fontWeight: 800 }}>
                  {language === 'he' ? service.titleHe : service.titleEn}
                </Typography>
                <Typography className="fy-muted" sx={{ lineHeight: 1.65 }}>
                  {language === 'he' ? service.descriptionHe : service.descriptionEn}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Box className="fy-public-grid">
        <Box className="fy-public-grid__main">
          <Paper className="fy-panel" sx={{ p: { xs: 3, md: 4 }, textAlign: 'start' }}>
            <span className="fy-section-kicker">{t({ he: 'היקף השירות', en: 'Service scope' })}</span>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              {t({ he: 'שירותי המעבדה כוללים', en: 'Our lab services include' })}
            </Typography>
            <List
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 0.5,
                p: 0,
              }}
            >
              {serviceItems.map((item) => (
                <ListItem key={item.en} sx={{ px: 0, py: 0.6 }}>
                  <Box
                    aria-hidden="true"
                    sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#42baf2', mr: 1.5, ml: 0.5, flexShrink: 0 }}
                  />
                  <ListItemText primary={t(item)} primaryTypographyProps={{ color: '#c0ccd3' }} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        <Box className="fy-public-grid__side">
          <Paper className="fy-panel" sx={{ p: { xs: 3, md: 4 }, height: '100%', textAlign: 'start' }}>
            <span className="fy-section-kicker">{t({ he: 'תיאום שירות', en: 'Arrange service' })}</span>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
              {t({ he: 'ספרו לנו מה המכשיר צריך.', en: 'Tell us what the device needs.' })}
            </Typography>
            <Typography className="fy-muted" sx={{ lineHeight: 1.65, mb: 2.5 }}>
              {t({
                he: 'שלחו תיאור קצר של המכשיר והתקלה. נציג יחזור אליכם עם שאלות המשך והנחיות למסירה.',
                en: 'Send a short description of the device and issue. We will follow up with questions and delivery instructions.',
              })}
            </Typography>
            <Stack spacing={1.25}>
              <Link href="tel:+972544770200" underline="none" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Phone sx={{ color: '#42baf2' }} />
                054-477-0200
              </Link>
              <Link href="mailto:info@fyuri.co.il" underline="none" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Email sx={{ color: '#42baf2' }} />
                info@fyuri.co.il
              </Link>
              <Button component={RouterLink} to="/contact?service=lab" variant="contained" sx={{ mt: 1.5 }}>
                {t({ he: 'שליחת בקשת שירות', en: 'Send a service request' })}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </PublicPageShell>
  );
}

export default LabServicesPage;
