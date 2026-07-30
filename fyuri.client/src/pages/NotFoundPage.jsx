import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSeo from '../hooks/useSeo';

function NotFoundPage() {
  const { t } = useLanguage();

  useSeo({
    title: t({ he: 'הדף לא נמצא', en: 'Page Not Found' }),
    description: t({
      he: 'הדף שחיפשת אינו קיים.',
      en: 'The page you were looking for does not exist.',
    }),
  });

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', py: 8 }}>
      <Typography variant="h1" sx={{ fontWeight: 700, fontSize: { xs: '4rem', md: '6rem' }, color: 'primary.main' }}>
        404
      </Typography>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        {t({ he: 'הדף לא נמצא', en: 'Page Not Found' })}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t({
          he: 'הדף שחיפשת אינו קיים או הוסר. בוא נחזיר אותך למסלול.',
          en: 'The page you were looking for does not exist or has been moved.',
        })}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" component={RouterLink} to="/">
          {t({ he: 'חזור לדף הבית', en: 'Back to Home' })}
        </Button>
        <Button variant="outlined" component={RouterLink} to="/products">
          {t({ he: 'לצפייה במוצרים', en: 'Browse Products' })}
        </Button>
      </Box>
    </Box>
  );
}

export default NotFoundPage;
