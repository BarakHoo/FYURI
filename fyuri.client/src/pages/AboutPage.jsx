import { Typography, Box, Paper, Grid } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

function AboutPage() {
  const { t } = useLanguage();

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        {t({ he: 'אודות FYURI', en: 'About FYURI' })}
      </Typography>

      <Paper sx={{ p: 4, my: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          {t({ he: 'מי אנחנו', en: 'Who We Are' })}
        </Typography>
        <Typography variant="body1" paragraph>
          {t({
            he: 'FYURI הינה חברה מובילה בתחום אמצעי ראיית לילה, המספקת פתרונות מתקדמים לצרכים ביטחוניים, צבאיים ואזרחיים.',
            en: 'FYURI is a leading company in the field of night vision equipment, providing advanced solutions for security, military and civilian needs.'
          })}
        </Typography>
        <Typography variant="body1" paragraph>
          {t({
            he: 'אנו מתמחים באספקת מכשירי ראיית לילה איכותיים, מגברי אור, אופטיקה מתקדמת ואביזרים נלווים.',
            en: 'We specialize in supplying quality night vision devices, image intensifier tubes, advanced optics and related accessories.'
          })}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              {t({ he: 'המומחיות שלנו', en: 'Our Expertise' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t({
                he: 'צוות מקצועי עם ניסיון רב שנים בתחום ציוד ראיית לילה וטכנולוגיות מתקדמות',
                en: 'Professional team with years of experience in night vision equipment and advanced technologies'
              })}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              {t({ he: 'שירות ותמיכה', en: 'Service & Support' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t({
                he: 'מעבדה מקצועית לתחזוקה, כיול ותיקון של מכשירי ראיית לילה',
                en: 'Professional lab for maintenance, calibration and repair of night vision devices'
              })}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              {t({ he: 'אמינות ואיכות', en: 'Reliability & Quality' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t({
                he: 'מוצרים איכותיים ממפרטים בדוקים עם אחריות מלאה',
                en: 'Quality products from verified specifications with full warranty'
              })}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, my: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          {t({ he: 'הערכים שלנו', en: 'Our Values' })}
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>{t({ he: 'מקצועיות:', en: 'Professionalism:' })}</strong> {t({
            he: 'אנו מחויבים לספק ללקוחותינו את השירות המקצועי ביותר והמומחיות הטכנית הגבוהה ביותר.',
            en: 'We are committed to providing our customers with the most professional service and highest technical expertise.'
          })}
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>{t({ he: 'אמינות:', en: 'Reliability:' })}</strong> {t({
            he: 'כל מוצר שאנו מספקים עובר בדיקות איכות קפדניות ומגיע עם אחריות מלאה.',
            en: 'Every product we supply undergoes rigorous quality testing and comes with full warranty.'
          })}
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>{t({ he: 'שירות:', en: 'Service:' })}</strong> {t({
            he: 'אנו מאמינים בשירות לקוחות מעולה וזמינות מלאה לכל שאלה או בעיה.',
            en: 'We believe in excellent customer service and full availability for any question or issue.'
          })}
        </Typography>
      </Paper>
    </Box>
  );
}

export default AboutPage;
