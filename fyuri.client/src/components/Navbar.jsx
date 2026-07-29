import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box } from '@mui/material';
import { ShoppingCart, Brightness4, Brightness7, Language, KeyboardArrowDown } from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useThemeMode } from '../context/ThemeContext';
import ProductsDropdown from './ProductsDropdown';
import Logo from './Logo';

function Navbar() {
  const { getCartCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        // Stay transparent until the user has scrolled about half the hero video's height
        const heroThreshold = window.innerHeight * 0.5;
        setIsScrolled(window.scrollY > heroThreshold);
      } else {
        // Non-home pages have no hero video, so the header should always be opaque
        setIsScrolled(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
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

  return (
    <AppBar 
      position="sticky" 
      elevation={isScrolled ? 2 : 0}
      sx={{ 
        top: '44px',
        backgroundColor: isScrolled 
          ? (mode === 'dark' ? '#0d1b2a' : '#0d47a1')
          : 'transparent',
        backdropFilter: isScrolled ? 'none' : 'blur(0px)',
        borderBottom: '1px solid',
        borderColor: isScrolled 
          ? (mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
          : 'transparent',
        transition: 'background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
        zIndex: 1200
      }}
    >
      <Toolbar sx={{ py: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        {/* Left Section - Navigation */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1, position: 'relative' }}>
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
            sx={{ position: 'relative' }}
          >
            <Button 
              color="inherit"
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
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              '&:hover': { opacity: 0.9 }
            }}
          >
            <Logo height={60} />
          </Box>
        )}

        {/* Right Section - Actions */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton
            color="inherit" 
            onClick={toggleTheme} 
            title={t({ he: 'החלף ערכת נושא', en: 'Toggle Theme' })}
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <IconButton 
            color="inherit" 
            onClick={toggleLanguage} 
            title={t({ he: 'English', en: 'עברית' })}
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <Language />
          </IconButton>

          <IconButton 
            color="inherit" 
            component={RouterLink} 
            to="/cart"
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <Badge badgeContent={getCartCount()} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
