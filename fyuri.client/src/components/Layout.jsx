import { Container, Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import TopBar from './TopBar';
import { useLocation } from 'react-router-dom';

function Layout({ children, fullWidth = false }) {
  const location = useLocation();
  const useFullWidthContent = fullWidth || location.pathname === '/';

  return (
    <Box 
      sx={{ 
        '--site-header-height': { xs: '64px', md: '108px' },
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
          height: 'var(--site-header-height)',
          flexShrink: 0,
        }}
      >
        <TopBar />
        <Navbar key={`${location.key}:${location.pathname}:${location.search}`} />
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
