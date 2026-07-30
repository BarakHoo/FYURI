import { useState, useEffect } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight, Email, Phone, WhatsApp, Facebook, Instagram } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';
import { useThemeMode } from '../context/ThemeContext';

// Scroll distance (in px) after which the top contact bar collapses out of view.
// Roughly equivalent to 2-3 mouse-wheel notches. Kept in sync with Navbar's
// sticky `top` offset so the header does not leave a gap when the bar hides.
export const TOP_BAR_HIDE_THRESHOLD = 200;
// Lower threshold to reveal the bar again. The gap between hide/show creates a
// dead zone (hysteresis) so collapsing the bar — which shifts scrollY — cannot
// bounce the page back across a single boundary and flicker hide/show rapidly.
export const TOP_BAR_SHOW_THRESHOLD = 120;
function TopBar() {
  const { t, language } = useLanguage();
  const { mode } = useThemeMode();
  const [slideIndex, setSlideIndex] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setHidden((prev) => {
        if (prev) {
          // Currently hidden: only reveal after scrolling well back up.
          return y > TOP_BAR_SHOW_THRESHOLD;
        }
        // Currently shown: only hide after passing the higher threshold.
        return y > TOP_BAR_HIDE_THRESHOLD;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1300,
        minHeight: hidden ? 0 : '44px',
        maxHeight: hidden ? 0 : '80px',
        bgcolor: mode === 'dark' ? '#0d3a52' : '#1a8fb8',
        color: 'white',
        py: hidden ? 0 : 0.75,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        overflow: 'hidden',
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
        transition: 'max-height 0.35s ease, min-height 0.35s ease, opacity 0.35s ease, padding 0.35s ease',
      }}
      aria-hidden={hidden}
    >
      <IconButton
        onClick={isRtl ? goToNext : goToPrevious}
        size="small"
        sx={{ color: 'inherit', flexShrink: 0 }}
        aria-label="previous"
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
        aria-label="next"
      >
        <ChevronRight fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default TopBar;
