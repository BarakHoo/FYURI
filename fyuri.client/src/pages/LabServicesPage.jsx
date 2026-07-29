import { Typography, Box, Paper, Grid, List, ListItem, ListItemText, Link, Stack } from '@mui/material';
import { Build, Visibility, Settings, Phone, Email, WhatsApp } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';

function LabServicesPage() {
  const { t, language } = useLanguage();

  const services = [
    {
      titleHe: 'תחזוקה ואחזקה',
      titleEn: 'Maintenance & Care',
      descriptionHe: 'שירותי תחזוקה שוטפים למכשירי ראיית לילה',
      descriptionEn: 'Ongoing maintenance services for night vision devices',
      icon: <Build sx={{ fontSize: 48 }} />,
    },
    {
      titleHe: 'כיול ובדיקה',
      titleEn: 'Calibration & Testing',
      descriptionHe: 'כיול מדויק ובדיקות איכות קפדניות',
      descriptionEn: 'Precise calibration and rigorous quality testing',
      icon: <Settings sx={{ fontSize: 48 }} />,
    },
    {
      titleHe: 'תיקונים',
      titleEn: 'Repairs',
      descriptionHe: 'תיקון מכשירים תקולים והחלפת רכיבים',
      descriptionEn: 'Repair of faulty devices and component replacement',
      icon: <Visibility sx={{ fontSize: 48 }} />,
    },
  ];

  const serviceList1 = [
    { he: 'בדיקות תקינות מקיפות', en: 'Comprehensive functionality tests' },
    { he: 'כיול אופטי מדויק', en: 'Precise optical calibration' },
    { he: 'החלפת מגברי אור', en: 'Image intensifier tube replacement' },
    { he: 'תיקון מערכות אלקטרוניות', en: 'Electronic system repair' },
  ];

  const serviceList2 = [
    { he: 'ניקוי ואיטום', en: 'Cleaning and sealing' },
    { he: 'שדרוגים והתאמות', en: 'Upgrades and modifications' },
    { he: 'בדיקות נזקים', en: 'Damage assessment' },
    { he: 'הערכת שווי', en: 'Valuation' },
  ];

  return (
    <Box sx={{ }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'left' }}>
        {t({ he: 'שירותי מעבדה', en: 'Lab Services' })}
      </Typography>

      <Paper sx={{ p: 4, my: 3 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ textAlign: 'left' }}>
          {t({ he: 'מעבדה מקצועית לאמצעי ראיית לילה', en: 'Professional Night Vision Lab' })}
        </Typography>
        <Typography variant="body1" paragraph sx={{ textAlign: 'left' }}>
          {t({
            he: 'המעבדה שלנו מצוידת בציוד המתקדם ביותר לטיפול, תחזוקה וכיול של מכשירי ראיית לילה מכל הסוגים.',
            en: 'Our lab is equipped with the most advanced equipment for servicing, maintaining and calibrating all types of night vision devices.'
          })}
        </Typography>
        <Typography variant="body1" paragraph sx={{ textAlign: 'left' }}>
          {t({
            he: 'הטכנאים המנוסים שלנו עברו הכשרה מקצועית ובעלי ניסיון רב שנים בתחום.',
            en: 'Our experienced technicians have undergone professional training and have years of experience in the field.'
          })}
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {services.map((service, index) => {
          return (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>{service.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {language === 'he' ? service.titleHe : service.titleEn}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {language === 'he' ? service.descriptionHe : service.descriptionEn}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ textAlign: 'left' }}>
          {t({ he: 'השירותים שלנו כוללים', en: 'Our Services Include' })}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List sx={{ textAlign: 'left' }}>
              {serviceList1.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={t(item)} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List sx={{ textAlign: 'left' }}>
              {serviceList2.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={t(item)} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 1, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
            {t({ he: 'צריך שירות? צור קשר', en: 'Need Service? Contact Us' })}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ textAlign: 'left' }}>
            {t({
              he: 'לתיאום פגישה או לקבלת מידע נוסף על שירותי המעבדה שלנו, אנא צור קשר באמצעות:',
              en: 'To schedule an appointment or get more information about our lab services, please reach out via:'
            })}
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone color="primary" />
              <Link href="tel:+972544770200" underline="hover" color="inherit">
                <Typography variant="body1">
                  {t({ he: 'טלפון: 054-477-0200', en: 'Phone: 054-477-0200' })}
                </Typography>
              </Link>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email color="primary" />
              <Link href="mailto:info@fyuri.co.il" underline="hover" color="inherit">
                <Typography variant="body1">
                  {t({ he: 'אימייל: info@fyuri.co.il', en: 'Email: info@fyuri.co.il' })}
                </Typography>
              </Link>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WhatsApp color="success" />
              <Link href="https://wa.me/972544770200" target="_blank" rel="noopener noreferrer" underline="hover" color="inherit">
                <Typography variant="body1">
                  {t({ he: 'וואטסאפ: 054-477-0200', en: 'WhatsApp: 054-477-0200' })}
                </Typography>
              </Link>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default LabServicesPage;
