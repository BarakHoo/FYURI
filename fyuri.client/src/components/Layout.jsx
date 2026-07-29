import { Container, Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import TopBar from './TopBar';

function Layout({ children, fullWidth = false }) {

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh'
      }}
    >
      <TopBar />
      <Navbar />
      {fullWidth ? (
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
