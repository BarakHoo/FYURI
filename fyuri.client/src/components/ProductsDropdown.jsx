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
import { productNavigationGroups } from './navigationConfig';

function ProductsDropdown({
  anchorEl,
  buttonId,
  onClose,
  open,
}) {
  const { t, language } = useLanguage();
  const isRtl = language === 'he';
  const accentColor = '#42baf2';
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
            mt: 0.5,
            color: '#e8f4fb',
            background:
              'linear-gradient(145deg, rgba(7,19,27,0.995), rgba(5,16,24,0.995))',
            border: '1px solid rgba(79, 195, 247, 0.32)',
            borderTop: `2px solid ${cyanColor}`,
            borderRadius: 1,
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.48)',
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
              opacity: 0.13,
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
              border: '1px solid rgba(66,186,242,0.46)',
              borderRadius: 0.5,
              '&:hover, &:focus-visible': {
                bgcolor: 'rgba(66,186,242,0.1)',
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
                        borderRadius: 0.75,
                        border: '1px solid transparent',
                        transition: 'background-color 160ms ease, border-color 160ms ease, transform 160ms ease',
                        '&:hover, &:focus-visible': {
                          bgcolor: 'rgba(79,195,247,0.09)',
                          borderColor: 'rgba(79,195,247,0.3)',
                          outline: 'none',
                          transform: `translateX(${isRtl ? '-3px' : '3px'})`,
                          '& .product-nav-icon': {
                            color: accentColor,
                            borderColor: 'rgba(66,186,242,0.45)',
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
                          sx={{ display: 'block', mt: 0.25, color: '#91a4b0', lineHeight: 1.35 }}
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
