import { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import TopBar from './TopBar';
import { useLocation } from 'react-router';

function Layout({ children, fullWidth = false }) {
  const location = useLocation();
  const catalogReferenceHeader = location.pathname === '/products';
  const [topBarCollapsed, setTopBarCollapsed] = useState(
    () => typeof window !== 'undefined' && window.scrollY > 12,
  );
  const useFullWidthContent = (
    fullWidth
    || location.pathname === '/'
    || location.pathname === '/products'
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

  return (
    <Box 
      sx={{ 
        '--site-topbar-height': {
          xs: '0px',
          md: catalogReferenceHeader ? '38px' : '44px',
        },
        '--site-navbar-height': {
          xs: '64px',
          md: '64px',
          lg: catalogReferenceHeader ? '93px' : '64px',
        },
        '--site-header-height': {
          xs: '64px',
          md: topBarCollapsed
            ? '64px'
            : (catalogReferenceHeader ? '102px' : '108px'),
          lg: topBarCollapsed
            ? (catalogReferenceHeader ? '93px' : '64px')
            : (catalogReferenceHeader ? '131px' : '108px'),
        },
        '--site-header-reserved-height': {
          xs: '64px',
          md: catalogReferenceHeader ? '102px' : '108px',
          lg: catalogReferenceHeader ? '131px' : '108px',
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
          height: 'var(--site-header-reserved-height)',
          flexShrink: 0,
          pointerEvents: 'none',
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
          <TopBar variant={catalogReferenceHeader ? 'catalog-reference' : 'default'} />
        </Box>
        <Box sx={{ pointerEvents: 'auto' }}>
          <Navbar
            key={`${location.key}:${location.pathname}:${location.search}`}
            variant={catalogReferenceHeader ? 'catalog-reference' : 'default'}
          />
        </Box>
      </Box>
      {useFullWidthContent ? (
        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>
      ) : (
        <Container component="main" sx={{ flex: 1, py: 4 }}>
          {children}
        </Container>
      )}
      <Footer />
    </Box>
  );
}

export default Layout;
