import { useState } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight, Email, Phone, WhatsApp, Facebook, Instagram } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';
import { useThemeMode } from '../context/ThemeContext';

function TopBar() {
  const { t, language } = useLanguage();
  const { mode } = useThemeMode();
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      key: 'email',
      content: (
        <Box
          component="a"
          href="mailto:info@fyuri.co.il"
          sx={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1, '&:hover': { textDecoration: 'underline' } }}
        >
          <Email sx={{ fontSize: 18 }} />
          {t({ he: 'אימייל: info@fyuri.co.il', en: 'Email: info@fyuri.co.il' })}
        </Box>
      )
    },
    {
      key: 'phone',
      content: (
        <Box
          component="a"
          href="tel:0544770200"
          sx={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1, '&:hover': { textDecoration: 'underline' } }}
        >
          <Phone sx={{ fontSize: 18 }} />
          {t({ he: 'טלפון: 054-477-0200', en: 'Phone: 054-477-0200' })}
        </Box>
      )
    },
    {
      key: 'social',
      content: (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <Tooltip title="WhatsApp" arrow>
            <IconButton
              component="a"
              href="https://wa.me/972544770200"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label={t({ he: 'פתח WhatsApp', en: 'Open WhatsApp' })}
              sx={{ color: 'inherit', p: 0.5, '&:hover': { color: '#25D366' } }}
            >
              <WhatsApp sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Facebook" arrow>
            <IconButton
              component="a"
              href="https://www.facebook.com/FYURINV"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label={t({ he: 'פתח Facebook', en: 'Open Facebook' })}
              sx={{ color: 'inherit', p: 0.5, '&:hover': { color: '#1877f2' } }}
            >
              <Facebook sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Instagram" arrow>
            <IconButton
              component="a"
              href="https://www.instagram.com/fyuri.night.vision/"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label={t({ he: 'פתח Instagram', en: 'Open Instagram' })}
              sx={{ color: 'inherit', p: 0.5, '&:hover': { color: '#e1306c' } }}
            >
              <Instagram sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  const goToPrevious = () => {
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const isRtl = language === 'he';
  const previousLabel = t({ he: 'הודעה קודמת', en: 'Previous announcement' });
  const nextLabel = t({ he: 'הודעה הבאה', en: 'Next announcement' });

  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        height: '44px',
        minHeight: '44px',
        boxSizing: 'border-box',
        flexShrink: 0,
        bgcolor: mode === 'dark' ? '#0d3a52' : '#1a8fb8',
        color: 'white',
        py: 0.75,
        px: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <IconButton
        onClick={isRtl ? goToNext : goToPrevious}
        size="small"
        sx={{ color: 'inherit', flexShrink: 0 }}
        aria-label={isRtl ? nextLabel : previousLabel}
      >
        <ChevronLeft fontSize="small" />
      </IconButton>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          fontSize: '0.85rem',
          fontWeight: 600,
          minHeight: 24,
        }}
      >
        {slides.map((slide, index) => (
          <Box
            key={slide.key}
            sx={{
              display: index === slideIndex ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeInTopBar 0.4s ease',
              '@keyframes fadeInTopBar': {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          >
            {slide.content}
          </Box>
        ))}
      </Box>

      <IconButton
        onClick={isRtl ? goToPrevious : goToNext}
        size="small"
        sx={{ color: 'inherit', flexShrink: 0 }}
        aria-label={isRtl ? previousLabel : nextLabel}
      >
        <ChevronRight fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default TopBar;
