import { useState } from 'react';
import { Box, Paper, Typography, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Visibility, 
  RemoveRedEye, 
  ViewComfy, 
  Memory, 
  Build, 
  Thermostat,
  Biotech,
  ViewInAr 
} from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';
import { useThemeMode } from '../context/ThemeContext';

function ProductsDropdown({ onClose }) {
  const { t, language } = useLanguage();
  const { mode } = useThemeMode();

  const categories = [
    {
      section: t({ he: 'מכשירי ראייה', en: 'Vision Devices' }),
      items: [
        {
          titleHe: 'חד עיניים',
          titleEn: 'Monoculars',
          descHe: 'מכשירי ראיית לילה חד עיניים',
          descEn: 'Single-eye night vision devices',
          icon: <Visibility />,
          link: '/products?category=monocular'
        },
        {
          titleHe: 'דו עיניים',
          titleEn: 'Binoculars',
          descHe: 'מכשירי ראיית לילה דו עיניים',
          descEn: 'Dual-eye night vision devices',
          icon: <RemoveRedEye />,
          link: '/products?category=binocular'
        },
        {
          titleHe: 'ארבע-עיניים',
          titleEn: 'Panoramic',
          descHe: 'מערכות ראייה ארבע-עיניות',
          descEn: 'Panoramic vision systems',
          icon: <ViewComfy />,
          link: '/products?category=panoramic'
        }
      ]
    },
    {
      section: t({ he: 'רכיבים ואופטיקה', en: 'Components & Optics' }),
      items: [
        {
          titleHe: 'מגברי אור',
          titleEn: 'Image Intensifiers',
          descHe: 'שפופרות Gen 2, Gen 3',
          descEn: 'Gen 2, Gen 3 tubes',
          icon: <Memory />,
          link: '/products?category=intensifier'
        },
        {
          titleHe: 'גופים',
          titleEn: 'Housings',
          descHe: 'גופים לחד עיני, דו עיני וארבע-עיני',
          descEn: 'Monocular, binocular & panoramic housings',
          icon: <ViewInAr />,
          link: '/products?category=housing'
        },
        {
          titleHe: 'עדשות ואופטיקה',
          titleEn: 'Lenses & Optics',
          descHe: 'עדשות מקצועיות',
          descEn: 'Professional lenses',
          icon: <Build />,
          link: '/products?category=optics'
        },
        {
          titleHe: 'תרמי',
          titleEn: 'Thermal',
          descHe: 'מכשירי הדמיה תרמית וקליפ-און',
          descEn: 'Thermal imagers & clip-ons',
          icon: <Thermostat />,
          link: '/products?category=thermal'
        }
      ]
    },
    {
      section: t({ he: 'אביזרים ושירותים', en: 'Accessories & Services' }),
      items: [
        {
          titleHe: 'אביזרים',
          titleEn: 'Accessories',
          descHe: 'כבלים, סוללות, חלפים',
          descEn: 'Cables, batteries, parts',
          icon: <Build />,
          link: '/products?category=accessories'
        },
        {
          titleHe: 'שירותי מעבדה',
          titleEn: 'Lab Services',
          descHe: 'תיקון ושדרוג',
          descEn: 'Repair & upgrade',
          icon: <Biotech />,
          link: '/services'
        }
      ]
    }
  ];

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        mt: 0,
        bgcolor: mode === 'dark' ? '#2a2a2a' : '#ffffff',
        borderRadius: 0,
        borderTop: '3px solid',
        borderColor: 'primary.main',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        zIndex: 1300,
        minWidth: '900px',
        maxWidth: '1100px',
        mx: 'auto',
        overflow: 'hidden',
        animation: 'slideDown 0.3s ease-out',
        '@keyframes slideDown': {
          from: {
            opacity: 0,
            transform: 'translateY(-20px)'
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }}
    >
      <Box sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {categories.map((section, sectionIdx) => (
            <Grid item xs={12} md={4} key={sectionIdx}>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  letterSpacing: 1,
                  mb: 2,
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}
              >
                {section.section}
              </Typography>
              <Divider sx={{ mb: 2, borderColor: 'primary.main', opacity: 0.3 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map((item, itemIdx) => (
                  <Box
                    key={itemIdx}
                    component={RouterLink}
                    to={item.link}
                    onClick={onClose}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 1,
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        transform: 'translateX(8px)',
                        '& .icon': {
                          color: 'primary.main',
                          transform: 'scale(1.1)'
                        }
                      }
                    }}
                  >
                    <Box
                      className="icon"
                      sx={{
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        mt: 0.5
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 0.5,
                          color: mode === 'dark' ? '#fff' : '#000'
                        }}
                      >
                        {language === 'he' ? item.titleHe : item.titleEn}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          display: 'block',
                          lineHeight: 1.4
                        }}
                      >
                        {language === 'he' ? item.descHe : item.descEn}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
}

export default ProductsDropdown;
