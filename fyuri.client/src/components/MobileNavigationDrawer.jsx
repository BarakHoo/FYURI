import { useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Build,
  Close,
  Email,
  ExpandLess,
  ExpandMore,
  Language,
  Phone,
  WhatsApp,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import { primaryNavigationItems, productNavigationGroups } from './navigationConfig';
import Logo from './Logo';

const drawerId = 'mobile-site-navigation';
const productLinksId = 'mobile-product-navigation';

const isRouteActive = (pathname, item) => (
  item.exact ? pathname === item.path : pathname.startsWith(item.path)
);

function MobileNavigationDrawer({
  open,
  onClose,
  onNavigate,
  productsOpen,
  onToggleProducts,
  location,
  language,
  mode,
  toggleTheme,
  onLanguageToggle,
  t,
}) {
  const closeButtonRef = useRef(null);
  const isRtl = language === 'he';
  const accentColor = mode === 'dark' ? '#b8ff3d' : '#2d6500';
  const accentTextColor = mode === 'dark' ? '#e9ffc7' : '#173900';
  const cyanColor = mode === 'dark' ? '#4fc3f7' : '#0d5f8a';

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [open]);

  if (!open) {
    return null;
  }

  const activeCategory = new URLSearchParams(location.search).get('category');
  const homeItem = primaryNavigationItems.find((item) => item.id === 'home');
  const secondaryItems = ['services', 'about', 'contact']
    .map((id) => primaryNavigationItems.find((item) => item.id === id))
    .filter(Boolean);

  const navigationItemSx = (active = false) => ({
    minHeight: 48,
    borderRadius: 1.5,
    mb: 0.5,
    color: active ? accentColor : 'text.primary',
    bgcolor: active
      ? (mode === 'dark' ? 'rgba(184, 255, 61, 0.09)' : 'rgba(45, 101, 0, 0.1)')
      : 'transparent',
    borderInlineStart: '2px solid',
    borderInlineStartColor: active ? accentColor : 'transparent',
    '&:hover, &:focus-visible': {
      bgcolor: mode === 'dark' ? 'rgba(79, 195, 247, 0.11)' : 'rgba(13, 95, 138, 0.09)',
      outline: `2px solid ${cyanColor}`,
      outlineOffset: '-2px',
    },
  });

  const renderRouteItem = (item) => {
    const active = isRouteActive(location.pathname, item);

    return (
      <ListItemButton
        key={item.id}
        component={RouterLink}
        to={item.path}
        onClick={onNavigate}
        selected={active}
        aria-current={active ? 'page' : undefined}
        sx={navigationItemSx(active)}
      >
        <ListItemText
          primary={t(item.label)}
          primaryTypographyProps={{ fontWeight: active ? 750 : 600 }}
        />
      </ListItemButton>
    );
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          'data-testid': 'mobile-nav-backdrop',
          sx: {
            backgroundColor: 'rgba(1, 7, 12, 0.72)',
            backdropFilter: 'blur(3px)',
          },
        },
        paper: {
          id: drawerId,
          'data-testid': 'mobile-nav-paper',
          dir: isRtl ? 'rtl' : 'ltr',
          role: 'dialog',
          'aria-modal': true,
          'aria-label': t({ he: 'תפריט ניווט', en: 'Navigation menu' }),
        },
      }}
      sx={{
        display: { xs: 'block', lg: 'none' },
        zIndex: (theme) => theme.zIndex.modal + 1,
        '& .MuiDrawer-paper': {
          width: 'min(88vw, 380px)',
          maxWidth: '100%',
          color: mode === 'dark' ? '#e8f4fb' : '#0d1b2a',
          background:
            mode === 'dark'
              ? 'linear-gradient(155deg, #07121d 0%, #0d1f2d 58%, #102838 100%)'
              : 'linear-gradient(155deg, #f8fbfd 0%, #eaf3f8 100%)',
          borderInlineEnd: '1px solid rgba(79, 195, 247, 0.34)',
          boxShadow: '0 0 48px rgba(0, 0, 0, 0.48)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: mode === 'dark' ? 0.22 : 0.12,
            backgroundImage:
              'linear-gradient(rgba(79,195,247,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(79,195,247,0.18) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, black, transparent 55%)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 68,
            px: 2,
            pt: 'env(safe-area-inset-top)',
            borderBottom: '1px solid rgba(79, 195, 247, 0.22)',
          }}
        >
          <Box
            component={RouterLink}
            to="/"
            onClick={onNavigate}
            aria-label={t({ he: 'FYURI, דף הבית', en: 'FYURI, home' })}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 48,
              borderRadius: 1,
              '&:focus-visible': {
                outline: `2px solid ${cyanColor}`,
                outlineOffset: 2,
              },
            }}
          >
            <Logo
              height={32}
              surface={mode === 'dark' ? 'dark' : 'light'}
              alt=""
            />
          </Box>

          <IconButton
            ref={closeButtonRef}
            data-testid="mobile-nav-close"
            onClick={onClose}
            aria-label={t({ he: 'סגור תפריט ניווט', en: 'Close navigation' })}
            sx={{
              width: 48,
              height: 48,
              color: 'inherit',
              border: '1px solid rgba(79, 195, 247, 0.24)',
              '&:focus-visible': {
                outline: `2px solid ${cyanColor}`,
                outlineOffset: 2,
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            px: 2,
            py: 2,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(79,195,247,0.5) transparent',
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(79,195,247,0.48)',
              borderRadius: 999,
            },
          }}
        >
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              mb: 1,
              color: 'text.secondary',
              fontFamily: 'var(--mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
            }}
          >
            {t({ he: 'ניווט ראשי', en: 'Primary navigation' })}
          </Typography>

          <List component="nav" aria-label={t({ he: 'ניווט ראשי', en: 'Primary navigation' })} disablePadding>
            {homeItem && renderRouteItem(homeItem)}

            <ListItemButton
              onClick={onToggleProducts}
              aria-expanded={productsOpen}
              aria-controls={productLinksId}
              sx={navigationItemSx(location.pathname.startsWith('/products'))}
            >
              <ListItemText
                primary={t({ he: 'מוצרים', en: 'Products' })}
                primaryTypographyProps={{ fontWeight: 700 }}
              />
              {productsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={productsOpen} timeout="auto" unmountOnExit>
              <Box
                id={productLinksId}
                sx={{
                  mx: 1,
                  mb: 1.5,
                  px: 1,
                  py: 1,
                  borderInlineStart: '1px solid rgba(79, 195, 247, 0.3)',
                }}
              >
                <ListItemButton
                  component={RouterLink}
                  to="/products"
                  onClick={onNavigate}
                  aria-current={
                    location.pathname === '/products' && !activeCategory ? 'page' : undefined
                  }
                  sx={navigationItemSx(
                    location.pathname === '/products' && !activeCategory,
                  )}
                >
                  <ListItemText
                    primary={t({ he: 'כל המוצרים', en: 'All products' })}
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                </ListItemButton>

                {productNavigationGroups.map((group) => (
                  <Box key={group.id} sx={{ mt: 1.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        px: 1.5,
                        mb: 0.5,
                        color: 'text.secondary',
                        fontWeight: 700,
                      }}
                    >
                      {t(group.label)}
                    </Typography>

                    {group.items.map((item) => {
                      const CategoryIcon = item.icon;
                      const active = (
                        location.pathname === '/products'
                        && activeCategory === item.value
                      );

                      return (
                        <ListItemButton
                          key={item.id}
                          component={RouterLink}
                          to={item.path}
                          onClick={onNavigate}
                          aria-current={active ? 'page' : undefined}
                          sx={{
                            ...navigationItemSx(active),
                            minHeight: 44,
                            py: 0.5,
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 36,
                              color: active ? accentColor : 'text.secondary',
                            }}
                          >
                            <CategoryIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={t(item.label)}
                            primaryTypographyProps={{ fontSize: '0.92rem' }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Collapse>

            <Button
              component={RouterLink}
              to="/builder"
              onClick={onNavigate}
              startIcon={<Build />}
              aria-current={location.pathname === '/builder' ? 'page' : undefined}
              fullWidth
              sx={{
                minHeight: 52,
                my: 1,
                justifyContent: 'flex-start',
                borderRadius: 1.5,
                color: accentTextColor,
                border: `1px solid ${mode === 'dark' ? 'rgba(184, 255, 61, 0.64)' : 'rgba(45, 101, 0, 0.62)'}`,
                background:
                  'linear-gradient(110deg, rgba(184,255,61,0.14), rgba(79,195,247,0.08))',
                boxShadow: `inset 3px 0 0 ${accentColor}, 0 0 20px rgba(184,255,61,0.08)`,
                fontWeight: 800,
                '&:hover, &:focus-visible': {
                  borderColor: accentColor,
                  backgroundColor: mode === 'dark'
                    ? 'rgba(184,255,61,0.16)'
                    : 'rgba(45,101,0,0.13)',
                  outline: `2px solid ${accentColor}`,
                  outlineOffset: 2,
                },
              }}
            >
              {t({ he: 'בנה את המכשיר שלך', en: 'Build your device' })}
            </Button>

            {secondaryItems.map(renderRouteItem)}
          </List>
        </Box>

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            px: 2,
            pt: 1.5,
            pb: 'max(16px, env(safe-area-inset-bottom))',
            borderTop: '1px solid rgba(79, 195, 247, 0.22)',
            bgcolor: mode === 'dark' ? 'rgba(2, 9, 15, 0.48)' : 'rgba(255,255,255,0.62)',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Button
              onClick={toggleTheme}
              startIcon={mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              fullWidth
              sx={{ minHeight: 44, color: 'inherit' }}
            >
              {t({
                he: mode === 'dark' ? 'מצב בהיר' : 'מצב כהה',
                en: mode === 'dark' ? 'Light mode' : 'Dark mode',
              })}
            </Button>
            <Button
              data-testid="drawer-language-toggle"
              onClick={onLanguageToggle}
              startIcon={<Language />}
              fullWidth
              sx={{ minHeight: 44, color: 'inherit' }}
            >
              {language === 'he' ? 'English' : 'עברית'}
            </Button>
          </Stack>

          <Divider sx={{ mb: 1.5, borderColor: 'rgba(79,195,247,0.18)' }} />

          <Stack direction="row" spacing={0.5} justifyContent="space-between">
            <Button
              component="a"
              href="https://wa.me/972544770200"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              startIcon={<WhatsApp />}
              sx={{ minWidth: 44, minHeight: 44, color: 'inherit' }}
            >
              WhatsApp
            </Button>
            <IconButton
              component="a"
              href="tel:0544770200"
              aria-label={t({ he: 'התקשר ל-FYURI', en: 'Call FYURI' })}
              sx={{ width: 44, height: 44, color: 'inherit' }}
            >
              <Phone />
            </IconButton>
            <IconButton
              component="a"
              href="mailto:info@fyuri.co.il"
              aria-label={t({ he: 'שלח אימייל ל-FYURI', en: 'Email FYURI' })}
              sx={{ width: 44, height: 44, color: 'inherit' }}
            >
              <Email />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}

export default MobileNavigationDrawer;
