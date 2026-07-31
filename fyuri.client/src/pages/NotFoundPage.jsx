import { Box, Button, Typography } from '@mui/material';
import { HomeOutlined, Inventory2Outlined } from '@mui/icons-material';
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
      <Box className="fy-panel fy-public-empty">
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          {t({ he: 'לא מצאנו כאן מערכת או רכיב.', en: 'No system or component was found here.' })}
        </Typography>
        <Typography className="fy-muted">
          {t({
            he: 'אם הגעתם לכאן מקישור באתר, נשמח שתעדכנו אותנו.',
            en: 'If an FYURI link brought you here, please let us know.',
          })}
        </Typography>
      </Box>
    </PublicPageShell>
  );
}

export default NotFoundPage;
