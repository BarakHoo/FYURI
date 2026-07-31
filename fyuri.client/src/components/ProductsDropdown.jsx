import {
  Box,
  Button,
  Divider,
  Popover,
  Typography,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { useThemeMode } from '../context/ThemeContext';
import { productNavigationGroups } from './navigationConfig';

function ProductsDropdown({
  anchorEl,
  buttonId,
  onClose,
  open,
}) {
  const { t, language } = useLanguage();
  const { mode } = useThemeMode();
  const isRtl = language === 'he';
  const accentColor = mode === 'dark' ? '#42baf2' : '#0d5f8a';
  const cyanColor = accentColor;

  return (
    <Popover
      id="desktop-products-navigation"
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableScrollLock
      marginThreshold={16}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{
        paper: {
          dir: isRtl ? 'rtl' : 'ltr',
          sx: {
            width: 'min(960px, calc(100vw - 32px))',
            mt: 1,
            color: mode === 'dark' ? '#e8f4fb' : '#0d1b2a',
            background:
              mode === 'dark'
                ? 'linear-gradient(145deg, rgba(7,18,29,0.98), rgba(15,39,54,0.98))'
                : 'linear-gradient(145deg, rgba(255,255,255,0.99), rgba(235,244,249,0.99))',
            border: '1px solid rgba(79, 195, 247, 0.32)',
            borderTop: `3px solid ${cyanColor}`,
            borderRadius: 2,
            boxShadow: '0 24px 70px rgba(0, 0, 0, 0.42)',
            maxHeight: 'calc(100vh - 96px)',
            overflowX: 'hidden',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(79,195,247,0.5) transparent',
            '&::-webkit-scrollbar': {
              width: 7,
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(79,195,247,0.48)',
              borderRadius: 999,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: mode === 'dark' ? 0.16 : 0.08,
              backgroundImage:
                'linear-gradient(rgba(79,195,247,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(79,195,247,0.16) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              maskImage: 'linear-gradient(to bottom, black, transparent 80%)',
            },
          },
        },
      }}
    >
      <Box
        component="nav"
        aria-labelledby={buttonId}
        aria-label={t({ he: 'קטגוריות מוצרים', en: 'Product categories' })}
        sx={{ position: 'relative', zIndex: 1, p: 3 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: cyanColor,
                fontFamily: 'var(--mono)',
                fontWeight: 800,
                letterSpacing: '0.14em',
              }}
            >
              FYURI / CATALOG
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {t({ he: 'מצא את המערכת המתאימה למשימה', en: 'Find the right system for the mission' })}
            </Typography>
          </Box>

          <Button
            component={RouterLink}
            to="/products"
            onClick={onClose}
            endIcon={<ArrowForward sx={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />}
            sx={{
              minHeight: 44,
              flexShrink: 0,
              color: accentColor,
              border: `1px solid ${mode === 'dark' ? 'rgba(66,186,242,0.46)' : 'rgba(13,95,138,0.48)'}`,
              '&:hover, &:focus-visible': {
                bgcolor: mode === 'dark' ? 'rgba(66,186,242,0.1)' : 'rgba(13,95,138,0.09)',
                borderColor: accentColor,
                outline: `2px solid ${accentColor}`,
                outlineOffset: 2,
              },
            }}
          >
            {t({ he: 'כל המוצרים', en: 'All products' })}
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${productNavigationGroups.length}, minmax(0, 1fr))`,
            gap: 3,
          }}
        >
          {productNavigationGroups.map((group) => (
            <Box key={group.id}>
              <Typography
                variant="subtitle2"
                sx={{
                  minHeight: 28,
                  color: cyanColor,
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                }}
              >
                {t(group.label)}
              </Typography>
              <Divider sx={{ my: 1.25, borderColor: 'rgba(79,195,247,0.24)' }} />

              <Box sx={{ display: 'grid', gap: 0.5 }}>
                {group.items.map((item) => {
                  const CategoryIcon = item.icon;

                  return (
                    <Box
                      key={item.id}
                      component={RouterLink}
                      to={item.path}
                      onClick={onClose}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '36px minmax(0, 1fr)',
                        gap: 1.25,
                        alignItems: 'start',
                        minHeight: 62,
                        p: 1.25,
                        color: 'inherit',
                        textDecoration: 'none',
                        borderRadius: 1.5,
                        border: '1px solid transparent',
                        transition: 'background-color 160ms ease, border-color 160ms ease, transform 160ms ease',
                        '&:hover, &:focus-visible': {
                          bgcolor:
                            mode === 'dark'
                              ? 'rgba(79,195,247,0.09)'
                              : 'rgba(13,71,161,0.06)',
                          borderColor: 'rgba(79,195,247,0.3)',
                          outline: 'none',
                          transform: `translateX(${isRtl ? '-3px' : '3px'})`,
                          '& .product-nav-icon': {
                            color: accentColor,
                            borderColor: mode === 'dark'
                              ? 'rgba(66,186,242,0.45)'
                              : 'rgba(13,95,138,0.48)',
                          },
                        },
                        '@media (prefers-reduced-motion: reduce)': {
                          transition: 'none',
                          '&:hover, &:focus-visible': {
                            transform: 'none',
                          },
                        },
                      }}
                    >
                      <Box
                        className="product-nav-icon"
                        sx={{
                          display: 'grid',
                          placeItems: 'center',
                          width: 34,
                          height: 34,
                          color: cyanColor,
                          border: '1px solid rgba(79,195,247,0.25)',
                          borderRadius: 1,
                          transition: 'color 160ms ease, border-color 160ms ease',
                        }}
                      >
                        <CategoryIcon fontSize="small" />
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 750, lineHeight: 1.25 }}>
                          {t(item.label)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', mt: 0.25, color: 'text.secondary', lineHeight: 1.35 }}
                        >
                          {t(item.description)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Popover>
  );
}

export default ProductsDropdown;
