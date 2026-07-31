import { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import TopBar from './TopBar';
import { useLocation } from 'react-router';

function Layout({ children, fullWidth = false }) {
  const location = useLocation();
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
        '--site-header-height': {
          xs: '64px',
          md: topBarCollapsed ? '64px' : '108px',
        },
        '--site-header-reserved-height': { xs: '64px', md: '108px' },
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
            height: topBarCollapsed ? 0 : 44,
            opacity: topBarCollapsed ? 0 : 1,
            overflow: 'hidden',
            pointerEvents: topBarCollapsed ? 'none' : 'auto',
            transform: topBarCollapsed ? 'translateY(-44px)' : 'translateY(0)',
            transition: 'height 220ms ease, opacity 160ms ease, transform 220ms ease',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
          }}
        >
          <TopBar />
        </Box>
        <Box sx={{ pointerEvents: 'auto' }}>
          <Navbar key={`${location.key}:${location.pathname}:${location.search}`} />
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
