import { Box, Button, Paper, Typography } from '@mui/material';
import { ArrowForward, ContactSupportOutlined, Inventory2Outlined } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import PublicPageShell from '../components/PublicPageShell';
import { useLanguage } from '../context/LanguageContext';

function AboutPage() {
  const { t } = useLanguage();

  const values = [
    {
      number: '01',
      title: t({ he: 'מומחיות מעשית', en: 'Practical Expertise' }),
      body: t({
        he: 'צוות מקצועי עם ניסיון בציוד ראיית לילה, אופטיקה וטכנולוגיות מתקדמות.',
        en: 'A professional team experienced in night-vision equipment, optics and advanced technologies.',
      }),
    },
    {
      number: '02',
      title: t({ he: 'שירות וליווי', en: 'Service & Support' }),
      body: t({
        he: 'מעבדה מקצועית לתחזוקה, כיול ותיקון, עם ליווי לפני ואחרי הרכישה.',
        en: 'Professional maintenance, calibration and repair, with guidance before and after purchase.',
      }),
    },
    {
      number: '03',
      title: t({ he: 'אמינות ואיכות', en: 'Reliability & Quality' }),
      body: t({
        he: 'מוצרים שנבחרים לפי מפרטים בדוקים ומקבלים בדיקת איכות ואחריות.',
        en: 'Products selected against verified specifications, with quality checks and warranty support.',
      }),
    },
  ];

  return (
    <PublicPageShell
      eyebrow={t({ he: 'FYURI / אודות', en: 'FYURI / ABOUT' })}
      title={t({ he: 'מומחיות שרואים גם בחושך.', en: 'Expertise you can trust in the dark.' })}
      description={t({
        he: 'FYURI מספקת מערכות ראיית לילה, רכיבים ושירותי מעבדה ללקוחות ביטחוניים, מקצועיים ואזרחיים.',
        en: 'FYURI supplies night-vision systems, components and lab services for security, professional and civilian needs.',
      })}
      actions={(
        <>
          <Button component={RouterLink} to="/products" variant="contained" startIcon={<Inventory2Outlined />}>
            {t({ he: 'לצפייה בקטלוג', en: 'View catalog' })}
          </Button>
          <Button component={RouterLink} to="/contact" variant="outlined" startIcon={<ContactSupportOutlined />}>
            {t({ he: 'דברו עם מומחה', en: 'Talk to an expert' })}
          </Button>
        </>
      )}
    >
      <Box className="fy-public-grid">
        <Box className="fy-public-grid__main">
          <Paper className="fy-panel" sx={{ p: { xs: 3, md: 4 }, textAlign: 'start' }}>
            <span className="fy-section-kicker">{t({ he: 'מי אנחנו', en: 'Who we are' })}</span>
            <Typography component="h2" variant="h4" className="fy-section-heading">
              {t({ he: 'מערכות, רכיבים ומעבדה תחת קורת גג אחת.', en: 'Systems, components and lab support in one place.' })}
            </Typography>
            <Typography sx={{ color: '#b4c3cc', lineHeight: 1.8, mb: 2 }}>
              {t({
                he: 'אנחנו מתמחים באספקת מכשירי ראיית לילה איכותיים, מגברי אור, אופטיקה מתקדמת ואביזרים נלווים. המטרה היא להתאים את המערכת ליישום האמיתי — לא רק למפרט על הנייר.',
                en: 'We specialize in quality night-vision devices, image intensifiers, advanced optics and supporting accessories. Our goal is to match the system to its real use—not only to a specification sheet.',
              })}
            </Typography>
            <Typography sx={{ color: '#b4c3cc', lineHeight: 1.8 }}>
              {t({
                he: 'כל תהליך מתחיל בהבנת הצורך וממשיך בבחירת רכיבים, בדיקה וליווי מקצועי לאורך חיי המוצר.',
                en: 'Every engagement starts with understanding the requirement and continues through component selection, testing and professional support throughout the product life cycle.',
              })}
            </Typography>
          </Paper>
        </Box>

        <Box className="fy-public-grid__side">
          <Paper className="fy-panel" sx={{ p: { xs: 3, md: 4 }, height: '100%', textAlign: 'start' }}>
            <span className="fy-section-kicker">{t({ he: 'הגישה שלנו', en: 'Our approach' })}</span>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              {t({ he: 'מקצועיות לפני מכירה.', en: 'Expertise before the sale.' })}
            </Typography>
            <Typography className="fy-muted" sx={{ lineHeight: 1.75 }}>
              {t({
                he: 'אנחנו מעדיפים להסביר את ההבדלים, לבדוק התאמה ולבנות תצורה נכונה — גם אם הפתרון הפשוט הוא המתאים ביותר.',
                en: 'We explain the differences, verify compatibility and build the right configuration—even when the simplest solution is the best one.',
              })}
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Box className="fy-value-cards" sx={{ mt: 2.5 }}>
        {values.map((value) => (
          <Paper key={value.number} className="fy-panel fy-panel--interactive fy-value-card">
            <Typography sx={{ color: '#42baf2', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: '0.72rem' }}>
              {value.number}
            </Typography>
            <Typography component="h3" variant="h6" sx={{ mt: 1.25, mb: 1, fontWeight: 800 }}>
              {value.title}
            </Typography>
            <Typography className="fy-muted" sx={{ lineHeight: 1.65 }}>
              {value.body}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button component={RouterLink} to="/services" variant="outlined" endIcon={<ArrowForward />}>
          {t({ he: 'הכירו את שירותי המעבדה', en: 'Explore our lab services' })}
        </Button>
      </Box>
    </PublicPageShell>
  );
}

export default AboutPage;
