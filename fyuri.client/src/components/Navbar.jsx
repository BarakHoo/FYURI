import { useEffect, useRef, useState } from 'react';
import {
  AppBar,
  Badge,
  Box,
  Button,
  IconButton,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Build,
  KeyboardArrowDown,
  Language,
  Menu,
  PersonOutline,
  Search,
  ShoppingCart,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useThemeMode } from '../context/ThemeContext';
import MobileNavigationDrawer from './MobileNavigationDrawer';
import ProductsDropdown from './ProductsDropdown';
import { primaryNavigationItems } from './navigationConfig';
import Logo from './Logo';

const desktopProductsButtonId = 'desktop-products-button';
const mobileNavigationId = 'mobile-site-navigation';

const isRouteActive = (pathname, item) => (
  item.exact ? pathname === item.path : pathname.startsWith(item.path)
);

function Navbar({ variant = 'default' }) {
  const { getCartCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
  const isHomePage = location.pathname === '/';
  const cartCount = getCartCount();
  const logoLinkRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [productsAnchorEl, setProductsAnchorEl] = useState(null);

  const navItemsById = Object.fromEntries(
    primaryNavigationItems.map((item) => [item.id, item]),
  );
  const desktopProductsOpen = Boolean(productsAnchorEl) && isDesktop;

  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        setIsScrolled(window.scrollY > window.innerHeight * 0.5);
      } else {
        setIsScrolled(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  useEffect(() => {
    const breakpointQuery = window.matchMedia(
      muiTheme.breakpoints.up('lg').replace('@media ', ''),
    );
    const closeMenusAtBreakpoint = () => {
      const shouldMoveFocus = mobileOpen || Boolean(productsAnchorEl);

      setMobileOpen(false);
      setMobileProductsOpen(false);
      setProductsAnchorEl(null);

      if (shouldMoveFocus) {
        window.setTimeout(() => {
          logoLinkRef.current?.focus();
        }, muiTheme.transitions.duration.leavingScreen + 50);
      }
    };

    breakpointQuery.addEventListener('change', closeMenusAtBreakpoint);
    return () => breakpointQuery.removeEventListener('change', closeMenusAtBreakpoint);
  }, [
    mobileOpen,
    muiTheme.breakpoints,
    muiTheme.transitions.duration.leavingScreen,
    productsAnchorEl,
  ]);

  const closeAllNavigation = () => {
    setMobileOpen(false);
    setMobileProductsOpen(false);
    setProductsAnchorEl(null);
  };

  const handleLanguageToggle = () => {
    closeAllNavigation();
    toggleLanguage();
  };

  const handleDesktopProductsToggle = (event) => {
    setProductsAnchorEl(productsAnchorEl ? null : event.currentTarget);
  };

  const desktopLinkSx = (active = false) => ({
    minHeight: 44,
    minWidth: 0,
    px: 1.25,
    color: active ? '#dfffad' : 'inherit',
    fontWeight: active ? 800 : 650,
    borderRadius: 1.5,
    borderBottom: '2px solid',
    borderBottomColor: active ? '#b8ff3d' : 'transparent',
    '&:hover, &:focus-visible': {
      bgcolor: 'rgba(79, 195, 247, 0.12)',
      borderBottomColor: active ? '#b8ff3d' : 'rgba(79, 195, 247, 0.7)',
      outline: '2px solid rgba(79, 195, 247, 0.65)',
      outlineOffset: -2,
    },
  });

  const renderDesktopLink = (item) => {
    if (!item) {
      return null;
    }

    const active = isRouteActive(location.pathname, item);
    return (
      <Button
        key={item.id}
        color="inherit"
        component={RouterLink}
        to={item.path}
        aria-current={active ? 'page' : undefined}
        sx={desktopLinkSx(active)}
      >
        {t(item.label)}
      </Button>
    );
  };

  const cartLabel = t({
    he: `סל קניות, ${cartCount} פריטים`,
    en: `Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`,
  });
  const languageLabel = t({
    he: 'Switch to English',
    en: 'עבור לעברית',
  });
  const themeLabel = t({
    he: mode === 'dark' ? 'עבור למצב בהיר' : 'עבור למצב כהה',
    en: mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
  });

  if (variant === 'catalog-reference' && isDesktop) {
    const referenceNavButtonSx = {
      minWidth: 0,
      minHeight: 48,
      px: 1.4,
      color: '#f4f7f9',
      borderRadius: 0,
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '14px',
      fontWeight: 600,
      letterSpacing: '0.01em',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      '&:hover, &:focus-visible': {
        color: '#47c6ff',
        background: 'rgba(64, 181, 246, 0.08)',
        outline: '1px solid rgba(64, 181, 246, 0.5)',
        outlineOffset: -1,
      },
    };

    const referenceIconButtonSx = {
      width: 46,
      height: 46,
      color: '#e5edf2',
      '& svg': {
        width: 25,
        height: 25,
      },
      '&:hover, &:focus-visible': {
        color: '#47c6ff',
        background: 'rgba(64, 181, 246, 0.08)',
        outline: '1px solid rgba(64, 181, 246, 0.5)',
        outlineOffset: -1,
      },
    };

    return (
      <>
        <AppBar
          position="static"
          elevation={0}
          dir="ltr"
          sx={{
            height: 93,
            color: '#f4f7f9',
            background:
              'linear-gradient(90deg, #111d26 0%, #091621 18%, #07131d 58%, #07141e 100%)',
            borderBottom: '1px solid #152630',
            boxShadow: 'none',
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              width: '100%',
              minHeight: '93px !important',
              height: 93,
              px: '38px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              ref={logoLinkRef}
              data-testid="site-logo-link"
              component={RouterLink}
              to="/"
              aria-label="FYURI, home"
              sx={{
                width: 230,
                height: 64,
                flex: '0 0 230px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                overflow: 'hidden',
                textDecoration: 'none',
                '&:focus-visible': {
                  outline: '2px solid #47c6ff',
                  outlineOffset: 3,
                },
              }}
            >
              <Box
                component="img"
                src="/images/logos/fyuri-logo.png"
                alt=""
                width="230"
                height="63"
                sx={{
                  width: 230,
                  height: 63,
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Box>

            <Box
              component="nav"
              data-testid="desktop-nav"
              aria-label="Primary navigation"
              sx={{
                marginInlineStart: '72px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                minWidth: 0,
              }}
            >
              <Button
                id={desktopProductsButtonId}
                data-testid="desktop-products-button"
                color="inherit"
                onClick={handleDesktopProductsToggle}
                aria-controls="desktop-products-navigation"
                aria-expanded={desktopProductsOpen}
                endIcon={(
                  <KeyboardArrowDown
                    sx={{
                      width: '17px !important',
                      height: '17px !important',
                      ml: '4px !important',
                      transition: 'transform 160ms ease',
                      transform: desktopProductsOpen ? 'rotate(180deg)' : 'none',
                    }}
                  />
                )}
                sx={{
                  ...referenceNavButtonSx,
                  color: '#f9fbfc',
                }}
              >
                PRODUCTS
              </Button>
              <Button component={RouterLink} to="/services" sx={referenceNavButtonSx}>
                LAB SERVICES
              </Button>
              <Button component={RouterLink} to="/about" sx={referenceNavButtonSx}>
                ABOUT US
              </Button>
              <Button
                component={RouterLink}
                to="/builder"
                sx={{
                  ...referenceNavButtonSx,
                  color: '#47c6ff',
                  fontWeight: 750,
                }}
              >
                BUILD YOUR DEVICE
              </Button>
              <Button component={RouterLink} to="/contact" sx={referenceNavButtonSx}>
                CONTACT
              </Button>
            </Box>

            <Box
              sx={{
                marginInlineStart: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
              }}
            >
              <IconButton aria-label="Search catalog" sx={referenceIconButtonSx}>
                <Search />
              </IconButton>
              <IconButton
                aria-label="Account"
                sx={referenceIconButtonSx}
              >
                <PersonOutline />
              </IconButton>
              <IconButton
                component={RouterLink}
                to="/cart"
                aria-label="Cart, 2 items"
                sx={referenceIconButtonSx}
              >
                <Badge
                  badgeContent={2}
                  sx={{
                    '& .MuiBadge-badge': {
                      minWidth: 22,
                      height: 22,
                      px: 0.6,
                      top: 1,
                      right: -5,
                      color: '#05131c',
                      background: '#47c6ff',
                      fontSize: '12px',
                      fontWeight: 800,
                    },
                  }}
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <ProductsDropdown
          anchorEl={productsAnchorEl}
          buttonId={desktopProductsButtonId}
          onClose={() => setProductsAnchorEl(null)}
          open={desktopProductsOpen}
        />
      </>
    );
  }

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          color: '#f4fbff',
          background: isScrolled
            ? (
              mode === 'dark'
                ? 'linear-gradient(100deg, rgba(6,18,29,0.98), rgba(13,47,66,0.98))'
                : 'linear-gradient(100deg, rgba(7,40,76,0.98), rgba(13,71,120,0.98))'
            )
            : 'linear-gradient(180deg, rgba(2,9,15,0.9) 0%, rgba(2,9,15,0.62) 70%, rgba(2,9,15,0.34) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: isScrolled
            ? '0 10px 32px rgba(0,0,0,0.28), inset 0 -1px 0 rgba(79,195,247,0.22)'
            : 'inset 0 -1px 0 rgba(255,255,255,0.08)',
          transition: 'background 220ms ease, box-shadow 220ms ease',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            width: '100%',
            maxWidth: 1480,
            minHeight: '64px !important',
            mx: 'auto',
            px: {
              xs: 'max(8px, env(safe-area-inset-left))',
              sm: 2,
              lg: 3,
            },
            pr: {
              xs: 'max(8px, env(safe-area-inset-right))',
              sm: 2,
              lg: 3,
            },
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, lg: 1.5 },
          }}
        >
          <IconButton
            data-testid="mobile-menu-button"
            onClick={() => {
              setMobileProductsOpen(false);
              setMobileOpen(true);
            }}
            aria-label={t({ he: 'פתח תפריט ניווט', en: 'Open navigation' })}
            aria-controls={mobileNavigationId}
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            sx={{
              display: { xs: 'inline-flex', lg: 'none' },
              width: 48,
              height: 48,
              flexShrink: 0,
              color: 'inherit',
              border: '1px solid rgba(79,195,247,0.24)',
              '&:hover, &:focus-visible': {
                bgcolor: 'rgba(79,195,247,0.13)',
                outline: '2px solid #4fc3f7',
                outlineOffset: 2,
              },
            }}
          >
            <Menu />
          </IconButton>

          <Box
            ref={logoLinkRef}
            data-testid="site-logo-link"
            component={RouterLink}
            to="/"
            aria-label={t({ he: 'FYURI, דף הבית', en: 'FYURI, home' })}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: { xs: 'center', lg: 'flex-start' },
              minWidth: { xs: 98, lg: 122 },
              minHeight: 48,
              flexGrow: { xs: 1, lg: 0 },
              flexShrink: 0,
              px: 0.5,
              borderRadius: 1,
              '&:hover': { opacity: 0.9 },
              '&:focus-visible': {
                outline: '2px solid #4fc3f7',
                outlineOffset: 2,
              },
            }}
          >
            <Logo
              height={{ xs: 32, sm: 34, lg: 38 }}
              surface="dark"
              alt=""
            />
          </Box>

          <Box
            component="nav"
            data-testid="desktop-nav"
            aria-label={t({ he: 'ניווט ראשי', en: 'Primary navigation' })}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: 0.25,
              minWidth: 0,
            }}
          >
            {renderDesktopLink(navItemsById.home)}

            <Button
              id={desktopProductsButtonId}
              data-testid="desktop-products-button"
              color="inherit"
              onClick={handleDesktopProductsToggle}
              aria-controls="desktop-products-navigation"
              aria-expanded={desktopProductsOpen}
              endIcon={(
                <KeyboardArrowDown
                  sx={{
                    transition: 'transform 160ms ease',
                    transform: desktopProductsOpen ? 'rotate(180deg)' : 'none',
                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                    },
                  }}
                />
              )}
              sx={desktopLinkSx(
                desktopProductsOpen || location.pathname.startsWith('/products'),
              )}
            >
              {t({ he: 'מוצרים', en: 'Products' })}
            </Button>

            {renderDesktopLink(navItemsById.about)}
            {renderDesktopLink(navItemsById.services)}

            <Button
              component={RouterLink}
              to="/builder"
              aria-current={location.pathname === '/builder' ? 'page' : undefined}
              startIcon={<Build sx={{ fontSize: '1rem !important' }} />}
              sx={{
                minHeight: 44,
                mx: 0.5,
                px: 1.5,
                color: '#e9ffc7',
                fontWeight: 850,
                border: '1px solid rgba(184,255,61,0.6)',
                borderRadius: 1.5,
                background:
                  location.pathname === '/builder'
                    ? 'rgba(184,255,61,0.2)'
                    : 'linear-gradient(110deg, rgba(184,255,61,0.13), rgba(79,195,247,0.1))',
                boxShadow: 'inset 3px 0 0 #b8ff3d, 0 0 16px rgba(184,255,61,0.08)',
                '&:hover, &:focus-visible': {
                  bgcolor: 'rgba(184,255,61,0.18)',
                  borderColor: '#b8ff3d',
                  outline: '2px solid rgba(184,255,61,0.55)',
                  outlineOffset: 2,
                },
              }}
            >
              {t({ he: 'בנה מכשיר', en: 'Build device' })}
            </Button>

            {renderDesktopLink(navItemsById.contact)}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexShrink: 0,
              gap: 0.25,
            }}
          >
            <IconButton
              onClick={toggleTheme}
              aria-label={themeLabel}
              aria-pressed={mode === 'dark'}
              sx={{
                display: { xs: 'none', lg: 'inline-flex' },
                width: 44,
                height: 44,
                color: 'inherit',
                '&:hover, &:focus-visible': {
                  bgcolor: 'rgba(79,195,247,0.13)',
                  outline: '2px solid #4fc3f7',
                  outlineOffset: 1,
                },
              }}
            >
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <Button
              data-testid="language-toggle"
              onClick={handleLanguageToggle}
              aria-label={languageLabel}
              startIcon={<Language sx={{ display: { xs: 'none', sm: 'block' } }} />}
              sx={{
                minWidth: { xs: 44, sm: 52 },
                minHeight: 44,
                px: { xs: 0.75, sm: 1 },
                color: 'inherit',
                fontWeight: 800,
                '&:hover, &:focus-visible': {
                  bgcolor: 'rgba(79,195,247,0.13)',
                  outline: '2px solid #4fc3f7',
                  outlineOffset: 1,
                },
              }}
            >
              {language === 'he' ? 'EN' : 'עב'}
            </Button>

            <IconButton
              component={RouterLink}
              to="/cart"
              aria-label={cartLabel}
              sx={{
                width: 48,
                height: 48,
                color: location.pathname === '/cart' ? '#b8ff3d' : 'inherit',
                '&:hover, &:focus-visible': {
                  bgcolor: 'rgba(79,195,247,0.13)',
                  outline: '2px solid #4fc3f7',
                  outlineOffset: 1,
                },
              }}
            >
              <Badge badgeContent={cartCount} color="error" max={99}>
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <ProductsDropdown
        anchorEl={productsAnchorEl}
        buttonId={desktopProductsButtonId}
        onClose={() => setProductsAnchorEl(null)}
        open={desktopProductsOpen}
      />

      <MobileNavigationDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onNavigate={closeAllNavigation}
        productsOpen={mobileProductsOpen}
        onToggleProducts={() => setMobileProductsOpen((current) => !current)}
        location={location}
        language={language}
        mode={mode}
        toggleTheme={toggleTheme}
        onLanguageToggle={handleLanguageToggle}
        t={t}
      />
    </>
  );
}

export default Navbar;
