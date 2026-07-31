import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import TopBar from './TopBar';
import { useLocation } from 'react-router';
import '../PublicSite.css';

function Layout({ children }) {
  const location = useLocation();
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
      <Box component="main" className="fy-site-main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout;
