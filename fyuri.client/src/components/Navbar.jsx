import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Drawer, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Collapse, Divider } from '@mui/material';
import { ShoppingCart, Brightness4, Brightness7, Language, KeyboardArrowDown, Menu as MenuIcon, Close as CloseIcon, ExpandLess, ExpandMore, Phone, WhatsApp } from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useThemeMode } from '../context/ThemeContext';
import ProductsDropdown from './ProductsDropdown';
import Logo from './Logo';
import { TOP_BAR_HIDE_THRESHOLD, TOP_BAR_SHOW_THRESHOLD } from './TopBar';

function Navbar() {
  const { getCartCount } = useCart();
  const { toggleLanguage, t } = useLanguage();
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [topBarHidden, setTopBarHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const productCategories = [
    { to: '/products?category=monocular', label: t({ he: 'חד עיניים', en: 'Monoculars' }) },
    { to: '/products?category=binocular', label: t({ he: 'דו עיניים', en: 'Binoculars' }) },
    { to: '/products?category=panoramic', label: t({ he: 'ארבע-עיניים', en: 'Panoramic' }) },
    { to: '/products?category=intensifier', label: t({ he: 'מגברי אור', en: 'Image Intensifiers' }) },
    { to: '/products?category=housing', label: t({ he: 'גופים', en: 'Housings' }) },
    { to: '/products?category=optics', label: t({ he: 'עדשות ואופטיקה', en: 'Lenses & Optics' }) },
    { to: '/products?category=thermal', label: t({ he: 'תרמי', en: 'Thermal' }) },
    { to: '/products?category=accessories', label: t({ he: 'אביזרים', en: 'Accessories' }) },
  ];

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileProductsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      // Keep the navbar's sticky offset in sync with the collapsing top bar.
      // Uses the same hysteresis (dead zone) as TopBar so the offset never
      // flickers when the bar's own height change nudges scrollY at the boundary.
      const y = window.scrollY;
      setTopBarHidden((prev) =>
        prev ? y > TOP_BAR_SHOW_THRESHOLD : y > TOP_BAR_HIDE_THRESHOLD
      );

      if (isHomePage) {
        // Stay transparent until the user has scrolled about half the hero video's height
        const heroThreshold = window.innerHeight * 0.5;
        setIsScrolled(window.scrollY > heroThreshold);
      } else {
        // Non-home pages have no hero video, so the header should always be opaque
        setIsScrolled(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const handleMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false);
    }, 200);
    setDropdownTimeout(timeout);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
  };

  const toggleDropdown = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setShowDropdown((prev) => !prev);
  };

  const handleProductsKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeDropdown();
    } else if ((event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') && !showDropdown) {
      event.preventDefault();
      setShowDropdown(true);
    }
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={isScrolled ? 2 : 0}
      sx={{ 
        top: topBarHidden ? '0px' : '44px',
        backgroundColor: isScrolled 
          ? (mode === 'dark' ? '#0d1b2a' : '#0d47a1')
          : 'transparent',
        backdropFilter: isScrolled ? 'none' : 'blur(0px)',
        borderBottom: '1px solid',
        borderColor: isScrolled 
          ? (mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
          : 'transparent',
        transition: 'background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, top 0.35s ease',
        zIndex: 1200
      }}
    >
      <Toolbar sx={{ py: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        {/* Mobile hamburger */}
        <Box sx={{ flex: { xs: '0 0 auto', md: '1 1 0' }, minWidth: 0, display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-start' }}>
          <IconButton
            color="inherit"
            aria-label={t({ he: 'פתח תפריט', en: 'Open menu' })}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Left Section - Navigation */}
        <Box sx={{ flex: '1 1 0', minWidth: 0, display: { xs: 'none', md: 'flex' }, gap: 1, position: 'relative' }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            {t({ he: 'בית', en: 'Home' })}
          </Button>

          {/* Products Dropdown */}
          <Box
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleProductsKeyDown}
            sx={{ position: 'relative' }}
          >
            <Button 
              color="inherit"
              onClick={toggleDropdown}
              aria-haspopup="true"
              aria-expanded={showDropdown}
              aria-controls="products-mega-menu"
              endIcon={<KeyboardArrowDown sx={{ 
                transition: 'transform 0.3s ease',
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />}
              sx={{ 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                bgcolor: showDropdown ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              {t({ he: 'מוצרים', en: 'Products' })}
            </Button>
            {showDropdown && <ProductsDropdown onClose={closeDropdown} />}
          </Box>

          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/about"
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            {t({ he: 'מי אנחנו', en: 'About Us' })}
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/services"
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            {t({ he: 'שירותי מעבדה', en: 'Lab Services' })}
          </Button>
          <Button 
            component={RouterLink} 
            to="/builder"
            sx={{
              position: 'relative',
              color: '#0a0f0a',
              fontWeight: 700,
              px: 2.2,
              borderRadius: '20px',
              background: 'linear-gradient(120deg, #7CFC00 0%, #3ddc84 45%, #00e5ff 100%)',
              backgroundSize: '200% 200%',
              animation: 'fyuriCtaGradient 4s ease infinite',
              boxShadow: '0 0 12px rgba(80, 250, 123, 0.55), 0 0 28px rgba(0, 229, 255, 0.25)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              '&:hover': {
                transform: 'translateY(-1px) scale(1.05)',
                boxShadow: '0 0 18px rgba(80, 250, 123, 0.85), 0 0 40px rgba(0, 229, 255, 0.45)',
                background: 'linear-gradient(120deg, #8cff1a 0%, #4dedb0 45%, #33eaff 100%)',
              },
              '@keyframes fyuriCtaGradient': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' },
              },
            }}
          >
            {t({ he: 'בנה מכשיר', en: 'Build Your Device' })}
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/contact"
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            {t({ he: 'צור קשר', en: 'Contact' })}
          </Button>
        </Box>

        {/* Center Section - Logo (hidden on homepage since the hero already shows it) */}
        {!isHomePage && (
          <Box
            component={RouterLink}
            to="/"
            sx={{
              // On mobile the logo grows to fill the gap between the hamburger
              // and the action cluster, centering its content so it has equal
              // spacing to the nearest button on each side. On desktop it stays
              // static between the two equal-width side rows (true page-center).
              flex: { xs: '1 1 auto', md: '0 0 auto' },
              minWidth: 0,
              justifyContent: 'center',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              '& img, & svg': { height: { xs: 40, md: 60 }, width: 'auto' },
              '&:hover': { opacity: 0.9 }
            }}
          >
            <Logo height={60} />
          </Box>
        )}

        {/* Right Section - Actions */}
        <Box sx={{ display: 'flex', gap: { xs: 0.25, md: 1 }, alignItems: 'center', flex: { xs: '0 0 auto', md: '1 1 0' }, minWidth: 0, justifyContent: 'flex-end' }}>
          <IconButton
            color="inherit" 
            onClick={toggleTheme} 
            title={t({ he: 'החלף ערכת נושא', en: 'Toggle Theme' })}
            sx={{ p: { xs: 0.75, md: 1 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <IconButton 
            color="inherit" 
            onClick={toggleLanguage} 
            title={t({ he: 'English', en: 'עברית' })}
            sx={{ p: { xs: 0.75, md: 1 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <Language />
          </IconButton>

          <IconButton 
            color="inherit" 
            component={RouterLink} 
            to="/cart"
            sx={{ p: { xs: 0.75, md: 1 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <Badge badgeContent={getCartCount()} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        // Always anchor to the "start" edge. MUI resolves this against the
        // theme direction: left in LTR (English) and right in RTL (Hebrew),
        // so the drawer always opens from the same side as the hamburger.
        anchor="left"
        open={mobileOpen}
        onClose={closeMobileMenu}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: mode === 'dark' ? '#0d1b2a' : '#0d47a1',
            color: 'white',
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t({ he: 'תפריט', en: 'Menu' })}
          </Typography>
          <IconButton color="inherit" onClick={closeMobileMenu} aria-label={t({ he: 'סגור תפריט', en: 'Close menu' })}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/" onClick={closeMobileMenu}>
              <ListItemText primary={t({ he: 'בית', en: 'Home' })} />
            </ListItemButton>
          </ListItem>

          {/* Products with expandable categories */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setMobileProductsOpen((prev) => !prev)}
              aria-expanded={mobileProductsOpen}
            >
              <ListItemText primary={t({ he: 'מוצרים', en: 'Products' })} />
              {mobileProductsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={mobileProductsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {productCategories.map((cat) => (
                <ListItemButton
                  key={cat.to}
                  component={RouterLink}
                  to={cat.to}
                  onClick={closeMobileMenu}
                  sx={{ pl: 4 }}
                >
                  <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={cat.label} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>

          <ListItem disablePadding sx={{ px: 2, py: 0.5 }}>
            <ListItemButton
              component={RouterLink}
              to="/builder"
              onClick={closeMobileMenu}
              sx={{
                justifyContent: 'center',
                color: '#0a0f0a',
                borderRadius: '16px',
                py: 1.25,
                background: 'linear-gradient(120deg, #7CFC00 0%, #3ddc84 45%, #00e5ff 100%)',
                backgroundSize: '200% 200%',
                animation: 'fyuriCtaGradientMobile 4s ease infinite',
                boxShadow: '0 0 12px rgba(80, 250, 123, 0.55), 0 0 28px rgba(0, 229, 255, 0.25)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover, &:active': {
                  background: 'linear-gradient(120deg, #8cff1a 0%, #4dedb0 45%, #33eaff 100%)',
                  boxShadow: '0 0 18px rgba(80, 250, 123, 0.85), 0 0 40px rgba(0, 229, 255, 0.45)',
                  transform: 'scale(1.02)',
                },
                '@keyframes fyuriCtaGradientMobile': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                  '100%': { backgroundPosition: '0% 50%' },
                },
              }}
            >
              <ListItemText
                primary={t({ he: 'בנה מכשיר', en: 'Build Your Device' })}
                primaryTypographyProps={{ sx: { fontWeight: 700, textAlign: 'center' } }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/services" onClick={closeMobileMenu}>
              <ListItemText primary={t({ he: 'שירותי מעבדה', en: 'Lab Services' })} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/about" onClick={closeMobileMenu}>
              <ListItemText primary={t({ he: 'מי אנחנו', en: 'About Us' })} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/contact" onClick={closeMobileMenu}>
              <ListItemText primary={t({ he: 'צור קשר', en: 'Contact' })} />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton component="a" href="tel:0544770200">
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><Phone /></ListItemIcon>
              <ListItemText primary={t({ he: 'טלפון: 054-477-0200', en: 'Phone: 054-477-0200' })} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component="a" href="https://wa.me/972544770200" target="_blank" rel="noopener noreferrer">
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><WhatsApp /></ListItemIcon>
              <ListItemText primary="WhatsApp" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
}

export default Navbar;
