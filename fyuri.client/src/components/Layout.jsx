import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import TopBar from './TopBar';
import { useLocation } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import '../PublicSite.css';

function Layout({ children }) {
  const location = useLocation();
  const { language, t } = useLanguage();
  const referenceHeader = true;
  const [topBarCollapsed, setTopBarCollapsed] = useState(
    () => typeof window !== 'undefined' && window.scrollY > 12,
  );

  useEffect(() => {
    let animationFrame = null;

    const updateTopBar = () => {
      if (animationFrame !== null) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        setTopBarCollapsed(window.scrollY > 12);
      });
    };

    window.addEventListener('scroll', updateTopBar, { passive: true });
    updateTopBar();

    return () => {
      window.removeEventListener('scroll', updateTopBar);
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    const routeMeta = [
      {
        match: (pathname) => pathname === '/',
        title: { he: 'FYURI | מערכות ראיית לילה ורכיבים', en: 'FYURI | Night Vision Systems & Components' },
        description: {
          he: 'מערכות ראיית לילה, רכיבים, אופטיקה ושירותי מעבדה עם ליווי מקצועי.',
          en: 'Night-vision systems, components, optics and lab services with expert guidance.',
        },
      },
      {
        match: (pathname) => pathname === '/products',
        title: { he: 'קטלוג מערכות ורכיבים | FYURI', en: 'Systems & Components Catalog | FYURI' },
        description: {
          he: 'עיינו במערכות ראיית לילה, מגברי אור, אופטיקה, גופים ואביזרים.',
          en: 'Browse night-vision systems, image intensifiers, optics, housings and accessories.',
        },
      },
      {
        match: (pathname) => pathname.startsWith('/products/'),
        title: { he: 'פרטי מוצר | FYURI', en: 'Product Details | FYURI' },
        description: {
          he: 'מפרט, זמינות ואפשרויות התאמה למוצרי FYURI.',
          en: 'Specifications, availability and configuration options for FYURI products.',
        },
      },
      {
        match: (pathname) => pathname === '/builder',
        title: { he: 'בניית מערכת ראיית לילה | FYURI', en: 'Build a Night Vision System | FYURI' },
        description: {
          he: 'בחרו גוף, מגבר אור, אופטיקה ורכיבים תואמים בממשק הבנייה של FYURI.',
          en: 'Choose a housing, image intensifier, optics and compatible components in the FYURI builder.',
        },
      },
      {
        match: (pathname) => pathname === '/services',
        title: { he: 'שירותי מעבדה | FYURI', en: 'Night Vision Lab Services | FYURI' },
        description: {
          he: 'בדיקה, תחזוקה, כיול, תיקון ושדרוג למערכות ראיית לילה.',
          en: 'Testing, maintenance, calibration, repair and upgrades for night-vision systems.',
        },
      },
      {
        match: (pathname) => pathname === '/about',
        title: { he: 'אודות FYURI', en: 'About FYURI' },
        description: {
          he: 'הגישה המקצועית של FYURI לבחירת מערכות, התאמת רכיבים ושירות מעבדה.',
          en: 'FYURI’s practical approach to system selection, component compatibility and lab support.',
        },
      },
      {
        match: (pathname) => pathname === '/contact',
        title: { he: 'צור קשר | FYURI', en: 'Contact FYURI' },
        description: {
          he: 'פנו לצוות FYURI לייעוץ מערכת, שאלת תאימות או בקשת שירות מעבדה.',
          en: 'Contact FYURI for system guidance, compatibility questions or a lab-service request.',
        },
      },
      {
        match: (pathname) => pathname === '/cart',
        title: { he: 'סל בקשת ההזמנה | FYURI', en: 'Order Request Cart | FYURI' },
        description: {
          he: 'בדקו את המערכות והרכיבים לפני שליחת בקשת ההזמנה.',
          en: 'Review systems and components before submitting your order request.',
        },
      },
      {
        match: (pathname) => pathname === '/checkout',
        title: { he: 'פרטי בקשת הזמנה | FYURI', en: 'Order Request Details | FYURI' },
        description: {
          he: 'השאירו פרטי קשר ומשלוח להשלמת בקשת ההזמנה. אין חיוב מקוון.',
          en: 'Provide contact and delivery details to complete the order request. No online payment is processed.',
        },
      },
      {
        match: (pathname) => pathname.startsWith('/order-confirmation/'),
        title: { he: 'בקשת ההזמנה התקבלה | FYURI', en: 'Order Request Received | FYURI' },
        description: {
          he: 'סיכום בקשת ההזמנה והצעדים הבאים מול צוות FYURI.',
          en: 'Order-request summary and next steps with the FYURI team.',
        },
      },
    ].find((entry) => entry.match(location.pathname));

    const resolved = routeMeta || {
      title: { he: 'העמוד לא נמצא | FYURI', en: 'Page Not Found | FYURI' },
      description: {
        he: 'חזרו לקטלוג, לבונה המכשירים או לצור קשר.',
        en: 'Return to the catalog, device builder or contact page.',
      },
    };

    document.title = resolved.title[language];
    const descriptionMeta = document.querySelector('meta[name="description"]');
    descriptionMeta?.setAttribute('content', resolved.description[language]);
  }, [language, location.pathname]);

  return (
    <Box 
      className="fy-public-shell"
      sx={{ 
        '--site-topbar-height': {
          xs: '0px',
          md: referenceHeader ? '38px' : '44px',
        },
        '--site-navbar-height': {
          xs: '64px',
          md: '64px',
          lg: referenceHeader ? '93px' : '64px',
        },
        '--site-header-height': {
          xs: '64px',
          md: topBarCollapsed
            ? '64px'
            : (referenceHeader ? '102px' : '108px'),
          lg: topBarCollapsed
            ? (referenceHeader ? '93px' : '64px')
            : (referenceHeader ? '131px' : '108px'),
        },
        '--site-header-reserved-height': {
          xs: '64px',
          md: referenceHeader ? '102px' : '108px',
          lg: referenceHeader ? '131px' : '108px',
        },
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh'
      }}
    >
      <Box component="a" href="#fy-main-content" className="fy-skip-link">
        {t({ he: 'דלג לתוכן הראשי', en: 'Skip to main content' })}
      </Box>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 'appBar',
          height: topBarCollapsed
            ? 'var(--site-navbar-height)'
            : 'var(--site-header-reserved-height)',
          flexShrink: 0,
          pointerEvents: 'none',
          transition: 'height 220ms ease',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      >
        <Box
          data-testid="contact-strip"
          aria-hidden={topBarCollapsed || undefined}
          inert={topBarCollapsed}
          sx={{
            display: { xs: 'none', md: 'block' },
            height: topBarCollapsed ? 0 : 'var(--site-topbar-height)',
            opacity: topBarCollapsed ? 0 : 1,
            overflow: 'hidden',
            pointerEvents: topBarCollapsed ? 'none' : 'auto',
            transform: topBarCollapsed
              ? 'translateY(calc(-1 * var(--site-topbar-height)))'
              : 'translateY(0)',
            transition: 'height 220ms ease, opacity 160ms ease, transform 220ms ease',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
          }}
        >
          <TopBar variant={referenceHeader ? 'catalog-reference' : 'default'} />
        </Box>
        <Box sx={{ pointerEvents: 'auto' }}>
          <Navbar
            key={location.pathname}
            variant={referenceHeader ? 'catalog-reference' : 'default'}
          />
        </Box>
      </Box>
      <Box
        component="main"
        id="fy-main-content"
        className="fy-site-main"
        tabIndex={-1}
        sx={{ flex: 1 }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout;
