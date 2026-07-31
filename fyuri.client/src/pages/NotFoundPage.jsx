import { Box, Button, Paper, Typography } from '@mui/material';
import {
  BuildOutlined,
  ContactSupportOutlined,
  HomeOutlined,
  Inventory2Outlined,
  SearchOffOutlined,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import PublicPageShell from '../components/PublicPageShell';
import { useLanguage } from '../context/LanguageContext';

function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <PublicPageShell
      eyebrow="FYURI / 404"
      title={t({ he: 'העמוד לא נמצא', en: 'Page not found' })}
      description={t({
        he: 'הקישור שביקשת אינו קיים או שהועבר. אפשר לחזור לדף הבית או להמשיך לקטלוג.',
        en: 'The page you requested does not exist or has moved. Return home or continue to the catalog.',
      })}
      heroImage="/images/banners/night-vision.jpg"
      actions={(
        <>
          <Button component={RouterLink} to="/" variant="contained" startIcon={<HomeOutlined />}>
            {t({ he: 'חזרה לדף הבית', en: 'Back to home' })}
          </Button>
          <Button component={RouterLink} to="/products" variant="outlined" startIcon={<Inventory2Outlined />}>
            {t({ he: 'לצפייה בקטלוג', en: 'View catalog' })}
          </Button>
        </>
      )}
    >
      <Box className="fy-404-layout">
        <Paper className="fy-panel fy-404-signal">
          <SearchOffOutlined aria-hidden="true" />
          <Box>
            <span className="fy-section-kicker">
              {t({ he: 'סטטוס ניווט', en: 'Navigation status' })}
            </span>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              {t({ he: 'לא נמצא כאן אות פעיל.', en: 'No active signal was found here.' })}
            </Typography>
            <Typography className="fy-muted">
              {t({
                he: 'ייתכן שהעמוד הועבר, שהמוצר אינו פעיל או שהכתובת הוקלדה באופן שגוי.',
                en: 'The page may have moved, the product may be inactive, or the address may have been entered incorrectly.',
              })}
            </Typography>
          </Box>
          <strong aria-hidden="true">404</strong>
        </Paper>

        <Box className="fy-quick-route-grid">
          <RouterLink to="/products">
            <Inventory2Outlined aria-hidden="true" />
            <span>
              <b>{t({ he: 'קטלוג מלא', en: 'Full catalog' })}</b>
              <small>{t({ he: 'מערכות, רכיבים ואופטיקה', en: 'Systems, components and optics' })}</small>
            </span>
          </RouterLink>
          <RouterLink to="/builder">
            <BuildOutlined aria-hidden="true" />
            <span>
              <b>{t({ he: 'בונה המכשירים', en: 'Device builder' })}</b>
              <small>{t({ he: 'התחילו מתצורה תואמת', en: 'Start with a compatible baseline' })}</small>
            </span>
          </RouterLink>
          <RouterLink to="/contact">
            <ContactSupportOutlined aria-hidden="true" />
            <span>
              <b>{t({ he: 'קבלת עזרה', en: 'Get help' })}</b>
              <small>{t({ he: 'דווחו על קישור או שאלו את הצוות', en: 'Report a link or ask the team' })}</small>
            </span>
          </RouterLink>
        </Box>

        <Typography className="fy-muted" sx={{ textAlign: 'center' }}>
          {t({
            he: 'אם קישור בתוך האתר הביא אתכם לכאן, שלחו לנו אותו ונבדוק.',
            en: 'If an FYURI link brought you here, send it to us and we will investigate.',
          })}
        </Typography>
      </Box>
    </PublicPageShell>
  );
}

export default NotFoundPage;
