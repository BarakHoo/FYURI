import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  CssBaseline,
} from '@mui/material';
import {
  Inventory2,
  ReceiptLong,
  Email,
  Logout,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Logo from '../Logo';

const drawerWidth = 240;

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, admin } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/fyuri-admin/login', { replace: true });
  };

  const navItems = [
    { label: 'Products', path: '/fyuri-admin/products', icon: <Inventory2 /> },
    { label: 'Orders', path: '/fyuri-admin/orders', icon: <ReceiptLong /> },
    { label: 'Customer Messages', path: '/fyuri-admin/messages', icon: <Email /> },
  ];

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          FYURI Admin
        </Typography>
      </Toolbar>
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <List>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{ 
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` }, 
          ml: { xs: 0, sm: `${drawerWidth}px` } 
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <IconButton
              component={RouterLink}
              to="/"
              sx={{ 
                p: 0,
                '&:hover': { backgroundColor: 'transparent' }
              }}
            >
              <Logo height={50} />
            </IconButton>
          </Box>
          {admin?.email && (
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {admin.email}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Permanent Drawer for desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            position: 'fixed',
            height: '100%'
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3,
          ml: { xs: 0, sm: `${drawerWidth}px` },
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default AdminLayout;
