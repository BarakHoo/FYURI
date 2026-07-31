import { useEffect, useRef, useState } from 'react';
import {
  AppBar,
  Badge,
  Box,
  Button,
  IconButton,
  Popover,
  TextField,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Build,
  HeadsetMicOutlined,
  KeyboardArrowDown,
  Language,
  Menu,
  Search,
  ShoppingCart,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useThemeMode } from '../context/ThemeContext';
import MobileNavigationDrawer from './MobileNavigationDrawer';
import ProductsDropdown from './ProductsDropdown';
import { primaryNavigationItems } from './navigationConfig';
import Logo from './Logo';

const desktopProductsButtonId = 'desktop-products-button';
const desktopCatalogSearchId = 'desktop-catalog-search';
const mobileNavigationId = 'mobile-site-navigation';

const isRouteActive = (pathname, item) => (
  item.exact ? pathname === item.path : pathname.startsWith(item.path)
);

function Navbar({ variant = 'default' }) {
  const { getCartCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
  const isHomePage = location.pathname === '/';
  const isRtl = language === 'he';
  const cartCount = getCartCount();
  const logoLinkRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [productsAnchorEl, setProductsAnchorEl] = useState(null);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const navItemsById = Object.fromEntries(
    primaryNavigationItems.map((item) => [item.id, item]),
  );
  const desktopProductsOpen = Boolean(productsAnchorEl) && isDesktop;
  const catalogSearchOpen = Boolean(searchAnchorEl) && isDesktop;

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
    setSearchAnchorEl(null);
  };

  const handleLanguageToggle = () => {
    closeAllNavigation();
    toggleLanguage();
  };

  const handleDesktopProductsToggle = (event) => {
    setSearchAnchorEl(null);
    setProductsAnchorEl(productsAnchorEl ? null : event.currentTarget);
  };

  const handleCatalogSearchToggle = (event) => {
    setProductsAnchorEl(null);
    setSearchAnchorEl(searchAnchorEl ? null : event.currentTarget);
  };

  const handleCatalogSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();

    closeAllNavigation();
    navigate(query ? `/products?${new URLSearchParams({ q: query })}` : '/products');
  };

  const desktopLinkSx = (active = false) => ({
    minHeight: 44,
    minWidth: 0,
    px: 1.25,
    color: active ? '#9ddfff' : 'inherit',
    fontWeight: active ? 800 : 650,
    borderRadius: 1.5,
    borderBottom: '2px solid',
    borderBottomColor: active ? '#42baf2' : 'transparent',
    '&:hover, &:focus-visible': {
      bgcolor: 'rgba(79, 195, 247, 0.12)',
      borderBottomColor: active ? '#42baf2' : 'rgba(66, 186, 242, 0.7)',
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
    he: 'החלף לאנגלית',
    en: 'Switch to Hebrew',
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
          dir={isRtl ? 'rtl' : 'ltr'}
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
              aria-label={t({ he: 'FYURI, דף הבית', en: 'FYURI, home' })}
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
                src="/images/logos/fyuri-logo-transparent.png"
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
              aria-label={t({ he: 'ניווט ראשי', en: 'Primary navigation' })}
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
                {t({ he: 'מוצרים', en: 'PRODUCTS' })}
              </Button>
              <Button component={RouterLink} to="/services" sx={referenceNavButtonSx}>
                {t({ he: 'שירותי מעבדה', en: 'LAB SERVICES' })}
              </Button>
              <Button component={RouterLink} to="/about" sx={referenceNavButtonSx}>
                {t({ he: 'מי אנחנו', en: 'ABOUT US' })}
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
                {t({ he: 'בנה את המכשיר שלך', en: 'BUILD YOUR DEVICE' })}
              </Button>
              <Button component={RouterLink} to="/contact" sx={referenceNavButtonSx}>
                {t({ he: 'צור קשר', en: 'CONTACT' })}
              </Button>
            </Box>

            <Box
              sx={{
                marginInlineStart: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <IconButton
                data-testid="catalog-search-button"
                id="desktop-catalog-search-button"
                onClick={handleCatalogSearchToggle}
                aria-label={t({ he: 'חיפוש בקטלוג', en: 'Search catalog' })}
                aria-controls={catalogSearchOpen ? desktopCatalogSearchId : undefined}
                aria-expanded={catalogSearchOpen}
                aria-haspopup="dialog"
                sx={referenceIconButtonSx}
              >
                <Search />
              </IconButton>
              <IconButton
                data-testid="catalog-support-link"
                component={RouterLink}
                to="/contact"
                onClick={closeAllNavigation}
                aria-label={t({
                  he: 'שירות לקוחות וצור קשר',
                  en: 'Customer support and contact',
                })}
                sx={referenceIconButtonSx}
              >
                <HeadsetMicOutlined />
              </IconButton>
              <Button
                data-testid="language-toggle"
                onClick={handleLanguageToggle}
                aria-label={languageLabel}
                sx={{
                  minWidth: 58,
                  width: 58,
                  height: 46,
                  px: '5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  color: '#e5edf2',
                  borderRadius: '50px',
                  fontFamily: '"Segoe UI", Arial, sans-serif',
                  fontSize: '12px',
                  fontWeight: 800,
                  lineHeight: 1,
                  '& svg': {
                    width: 18,
                    height: 18,
                  },
                  '&:hover, &:focus-visible': {
                    color: '#47c6ff',
                    background: 'rgba(64, 181, 246, 0.08)',
                    outline: '1px solid rgba(64, 181, 246, 0.5)',
                    outlineOffset: -1,
                  },
                }}
              >
                <Language aria-hidden="true" />
                <span>{language === 'he' ? 'EN' : 'עב'}</span>
              </Button>
              <IconButton
                component={RouterLink}
                to="/cart"
                aria-label={cartLabel}
                sx={referenceIconButtonSx}
              >
                <Badge
                  badgeContent={cartCount}
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

        <Popover
          id={desktopCatalogSearchId}
          open={catalogSearchOpen}
          anchorEl={searchAnchorEl}
          onClose={() => setSearchAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: isRtl ? 'left' : 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: isRtl ? 'left' : 'right' }}
          slotProps={{
            paper: {
              role: 'dialog',
              'aria-label': t({ he: 'חיפוש מוצרים', en: 'Product search' }),
              sx: {
                mt: 1,
                p: 2,
                width: 'min(420px, calc(100vw - 32px))',
                color: '#e8f4fb',
                background: 'linear-gradient(145deg, #07121d, #102838)',
                border: '1px solid rgba(71, 198, 255, 0.42)',
                borderRadius: 1.5,
                boxShadow: '0 18px 54px rgba(0, 0, 0, 0.52)',
              },
            },
          }}
        >
          <Box
            component="form"
            role="search"
            aria-label={t({ he: 'חיפוש בקטלוג', en: 'Catalog search' })}
            onSubmit={handleCatalogSearchSubmit}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 1,
              alignItems: 'start',
            }}
          >
            <TextField
              autoFocus
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              label={t({ he: 'חיפוש מוצרים', en: 'Search products' })}
              inputProps={{
                enterKeyHint: 'search',
              }}
              sx={{
                '& .MuiInputLabel-root': { color: '#a9bac5' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#47c6ff' },
                '& .MuiOutlinedInput-root': {
                  color: '#f4f7f9',
                  background: 'rgba(1, 8, 13, 0.52)',
                  '& fieldset': { borderColor: 'rgba(71, 198, 255, 0.34)' },
                  '&:hover fieldset': { borderColor: 'rgba(71, 198, 255, 0.62)' },
                  '&.Mui-focused fieldset': { borderColor: '#47c6ff' },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                minHeight: 40,
                color: '#041018',
                background: '#47c6ff',
                fontWeight: 800,
                '&:hover, &:focus-visible': {
                  background: '#78d5ff',
                  outline: '2px solid #d9f4ff',
                  outlineOffset: 1,
                },
              }}
            >
              {t({ he: 'חיפוש', en: 'Search' })}
            </Button>
          </Box>
        </Popover>
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
                color: '#d8f3ff',
                fontWeight: 850,
                border: '1px solid rgba(66,186,242,0.6)',
                borderRadius: 1.5,
                background:
                  location.pathname === '/builder'
                    ? 'rgba(66,186,242,0.2)'
                    : 'linear-gradient(110deg, rgba(66,186,242,0.13), rgba(79,195,247,0.1))',
                boxShadow: 'inset 3px 0 0 #42baf2, 0 0 16px rgba(66,186,242,0.08)',
                '&:hover, &:focus-visible': {
                  bgcolor: 'rgba(66,186,242,0.18)',
                  borderColor: '#42baf2',
                  outline: '2px solid rgba(66,186,242,0.55)',
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
                color: location.pathname === '/cart' ? '#42baf2' : 'inherit',
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
