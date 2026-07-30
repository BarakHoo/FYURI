import {
  ArrowForward,
  Build,
  Construction,
  ManageSearch,
  ScienceOutlined,
  Settings,
  WhatsApp,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { productCategories } from '../components/navigationConfig';
import { useLanguage } from '../context/LanguageContext';
import { useThemeMode } from '../context/ThemeContext';

const featuredCategoryValues = [
  'monocular',
  'binocular',
  'panoramic',
  'intensifier',
];

const categoryMedia = {
  monocular: {
    src: '/images/products/pvs-14.jpg',
    width: 438,
    height: 315,
    position: 'center',
  },
  binocular: {
    src: '/images/products/pvs-31.jpg',
    width: 1920,
    height: 2560,
    position: '50% 49%',
  },
  panoramic: {
    src: '/images/banners/night-vision.jpg',
    width: 1024,
    height: 572,
    position: 'center',
  },
  intensifier: {
    src: '/images/banners/image-intensifier.jpg',
    width: 587,
    height: 461,
    position: 'center',
  },
};

const focusRing = (color = '#b8ff3d', outlineOffset = 3) => ({
  '&:focus-visible': {
    outline: `3px solid ${color}`,
    outlineOffset,
  },
});

function SectionLabel({ children, color = '#4fc3f7' }) {
  return (
    <Typography
      component="p"
      lang="en"
      sx={{
        color,
        fontFamily: 'var(--mono)',
        fontSize: '0.72rem',
        fontWeight: 800,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Typography>
  );
}

function HomePage() {
  const { language, t } = useLanguage();
  const { mode } = useThemeMode();
  const isRtl = language === 'he';
  const isDark = mode === 'dark';

  const featuredCategories = featuredCategoryValues
    .map((value) => productCategories.find((category) => category.value === value))
    .filter(Boolean);

  const capabilityPaths = [
    {
      id: 'systems',
      number: '01',
      path: '/products',
      icon: ManageSearch,
      title: t({ he: 'מערכות', en: 'Systems' }),
      description: t({
        he: 'חד־עיניות, דו־עיניות, פנורמיות ותרמיות',
        en: 'Monocular, binocular, panoramic and thermal',
      }),
    },
    {
      id: 'builder',
      number: '02',
      path: '/builder',
      icon: Build,
      title: t({ he: 'בניית מכשיר', en: 'Device builder' }),
      description: t({
        he: 'תצורה, מגבר אור, אופטיקה ורכיבים',
        en: 'Form factor, image intensifier, optics and components',
      }),
    },
    {
      id: 'lab',
      number: '03',
      path: '/services',
      icon: ScienceOutlined,
      title: t({ he: 'שירותי מעבדה', en: 'Lab services' }),
      description: t({
        he: 'תחזוקה, כיול ותיקון',
        en: 'Maintenance, calibration and repair',
      }),
    },
  ];

  const labServices = [
    {
      number: '01',
      icon: Settings,
      title: t({ he: 'כיול ובדיקה', en: 'Calibration & testing' }),
      description: t({
        he: 'בדיקות תקינות וכיול אופטי למכשירי ראיית לילה.',
        en: 'Functionality checks and optical calibration for night vision devices.',
      }),
    },
    {
      number: '02',
      icon: ScienceOutlined,
      title: t({ he: 'תחזוקה ואיטום', en: 'Maintenance & sealing' }),
      description: t({
        he: 'ניקוי, איטום, תחזוקה שוטפת והערכת נזקים.',
        en: 'Cleaning, sealing, ongoing maintenance and damage assessment.',
      }),
    },
    {
      number: '03',
      icon: Construction,
      title: t({ he: 'תיקון והחלפה', en: 'Repair & replacement' }),
      description: t({
        he: 'תיקון מערכות והחלפת רכיבים ומגברי אור.',
        en: 'System repair plus component and image intensifier replacement.',
      }),
    },
  ];

  const builderSteps = [
    t({ he: 'בחרו תצורה', en: 'Choose a form factor' }),
    t({ he: 'בחרו רכיבים', en: 'Choose components' }),
    t({ he: 'עברו על התצורה', en: 'Review the configuration' }),
  ];

  return (
    <Box
      sx={{
        bgcolor: isDark ? '#07111b' : '#eef3f8',
        color: 'text.primary',
        overflowX: 'clip',
      }}
    >
      <Box
        component="section"
        data-testid="home-hero"
        aria-labelledby="home-hero-title"
        sx={{
          position: 'relative',
          minHeight: {
            xs: 'calc(100svh + var(--site-header-reserved-height))',
            md: 'min(940px, calc(100svh + var(--site-header-reserved-height)))',
          },
          mt: 'calc(0px - var(--site-header-reserved-height))',
          color: '#edf9ff',
          background:
            'radial-gradient(circle at 75% 32%, rgba(79,195,247,0.18), transparent 30%), radial-gradient(circle at 18% 78%, rgba(184,255,61,0.08), transparent 28%), linear-gradient(135deg, #02070c 0%, #07131e 52%, #0c2432 100%)',
          isolation: 'isolate',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            opacity: 0.24,
            backgroundImage:
              'linear-gradient(rgba(79,195,247,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(79,195,247,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to bottom, black, transparent 86%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            insetInlineStart: { xs: 18, md: 32 },
            top: 'calc(var(--site-header-reserved-height) + 28px)',
            width: 58,
            height: 58,
            borderBlockStart: '1px solid rgba(184,255,61,0.55)',
            borderInlineStart: '1px solid rgba(184,255,61,0.55)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            alignItems: 'center',
            minHeight: 'inherit',
            pt: {
              xs: 'calc(var(--site-header-reserved-height) + 72px)',
              md: 'calc(var(--site-header-reserved-height) + 80px)',
            },
            pb: { xs: 11, md: 12 },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.04fr) minmax(390px, 0.96fr)' },
              gap: { xs: 6, md: 8, lg: 10 },
              alignItems: 'center',
            }}
          >
            <Box sx={{ maxWidth: 790, textAlign: 'start' }}>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ mb: 3 }}
              >
                <Chip
                  label="FYURI / NIGHT SYSTEMS"
                  size="small"
                  sx={{
                    color: '#b8ff3d',
                    bgcolor: 'rgba(184,255,61,0.08)',
                    border: '1px solid rgba(184,255,61,0.32)',
                    fontFamily: 'var(--mono)',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                  }}
                />
                <Chip
                  label={t({ he: 'מערכות · רכיבים · מעבדה', en: 'SYSTEMS · COMPONENTS · LAB' })}
                  size="small"
                  sx={{
                    color: '#9ddfff',
                    bgcolor: 'rgba(79,195,247,0.08)',
                    border: '1px solid rgba(79,195,247,0.28)',
                    fontFamily: 'var(--mono)',
                    fontWeight: 750,
                    letterSpacing: language === 'en' ? '0.07em' : 0,
                  }}
                />
              </Stack>

              <Typography
                id="home-hero-title"
                component="h1"
                sx={{
                  m: 0,
                  maxWidth: 850,
                  fontSize: 'clamp(2.45rem, 5.8vw, 5.8rem)',
                  fontWeight: 900,
                  lineHeight: 0.97,
                  letterSpacing: '-0.045em',
                  textWrap: 'balance',
                }}
              >
                {t({ he: 'מערכות ראיית לילה,', en: 'Night vision systems,' })}
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    mt: 0.4,
                    color: '#b8ff3d',
                    textShadow: '0 0 28px rgba(184,255,61,0.12)',
                  }}
                >
                  {t({ he: 'רכיבים ושירותי מעבדה.', en: 'components and lab services.' })}
                </Box>
              </Typography>

              <Typography
                component="p"
                sx={{
                  maxWidth: 720,
                  mt: 3.5,
                  color: '#bed0dc',
                  fontSize: { xs: '1.05rem', md: '1.22rem' },
                  lineHeight: 1.65,
                  textWrap: 'pretty',
                }}
              >
                {t({
                  he: 'עיינו במערכות חד עיניות, דו עיניות, פנורמיות ותרמיות, או בנו מכשיר מותאם אישית.',
                  en: 'Browse monocular, binocular, panoramic and thermal systems, or configure your own device.',
                })}
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ mt: 4.5, alignItems: { xs: 'stretch', sm: 'center' } }}
              >
                <Button
                  data-testid="hero-catalog-cta"
                  component={RouterLink}
                  to="/products"
                  variant="contained"
                  size="large"
                  endIcon={(
                    <ArrowForward sx={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                  )}
                  sx={{
                    minHeight: 52,
                    px: 3,
                    color: '#102000',
                    bgcolor: '#b8ff3d',
                    fontWeight: 900,
                    boxShadow: '0 12px 34px rgba(184,255,61,0.16)',
                    '&:hover': {
                      bgcolor: '#caff70',
                      boxShadow: '0 16px 40px rgba(184,255,61,0.23)',
                    },
                    ...focusRing(),
                  }}
                >
                  {t({ he: 'צפו בקטלוג', en: 'View catalog' })}
                </Button>

                <Button
                  data-testid="hero-builder-cta"
                  component={RouterLink}
                  to="/builder"
                  variant="outlined"
                  size="large"
                  startIcon={<Build />}
                  sx={{
                    minHeight: 52,
                    px: 3,
                    color: '#edf9ff',
                    borderColor: 'rgba(157,223,255,0.56)',
                    fontWeight: 800,
                    '&:hover': {
                      borderColor: '#4fc3f7',
                      bgcolor: 'rgba(79,195,247,0.09)',
                    },
                    ...focusRing(),
                  }}
                >
                  {t({ he: 'בנו מכשיר ראיית לילה', en: 'Build your night vision device' })}
                </Button>
              </Stack>

              <Button
                data-testid="hero-whatsapp-cta"
                component="a"
                href="https://wa.me/972544770200"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<WhatsApp />}
                sx={{
                  minHeight: 48,
                  mt: 1.5,
                  px: 0.5,
                  color: '#b7cad6',
                  justifyContent: 'flex-start',
                  fontWeight: 700,
                  '&:hover': { color: '#dfffad', bgcolor: 'transparent' },
                  ...focusRing(),
                }}
              >
                {t({ he: 'דברו איתנו ב-WhatsApp', en: 'Talk to us on WhatsApp' })}
              </Button>
            </Box>

            <Box
              component="figure"
              sx={{
                position: 'relative',
                m: 0,
                minHeight: { xs: 390, sm: 520, lg: 650 },
                border: '1px solid rgba(79,195,247,0.36)',
                borderRadius: { xs: 2, md: 3 },
                overflow: 'hidden',
                boxShadow: '0 34px 90px rgba(0,0,0,0.48)',
                bgcolor: '#071826',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                  background:
                    'linear-gradient(to bottom, rgba(2,7,12,0.06), rgba(2,7,12,0.2) 48%, rgba(2,7,12,0.88)), linear-gradient(90deg, rgba(2,7,12,0.32), transparent 36%)',
                  pointerEvents: 'none',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  zIndex: 3,
                  inset: 20,
                  border: '1px solid rgba(184,255,61,0.2)',
                  borderRadius: 1,
                  pointerEvents: 'none',
                },
              }}
            >
              <img
                src="/images/products/pvs-31.jpg"
                alt={t({
                  he: 'מערכת ראיית לילה דו־עינית בתאורה כחולה',
                  en: 'Binocular night vision system under blue lighting',
                })}
                width={1920}
                height={2560}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: '50% 49%',
                  filter: 'saturate(0.9) contrast(1.06)',
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  zIndex: 4,
                  insetInlineStart: { xs: 36, md: 44 },
                  top: { xs: 36, md: 44 },
                }}
              >
                <SectionLabel color="#dfffad">OPTICAL / SYSTEM</SectionLabel>
                <Typography sx={{ mt: 0.5, color: '#fff', fontWeight: 850 }}>
                  {t({ he: 'בחירת תצורה ורכיבים', en: 'Choose a form factor & components' })}
                </Typography>
              </Box>

              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  zIndex: 4,
                  top: '50%',
                  left: '50%',
                  width: { xs: 112, md: 150 },
                  height: { xs: 112, md: 150 },
                  border: '1px solid rgba(184,255,61,0.4)',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    bgcolor: 'rgba(184,255,61,0.38)',
                  },
                  '&::before': {
                    width: 1,
                    height: 'calc(100% + 46px)',
                    left: '50%',
                    top: -23,
                  },
                  '&::after': {
                    height: 1,
                    width: 'calc(100% + 46px)',
                    top: '50%',
                    left: -23,
                  },
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  zIndex: 4,
                  insetInline: { xs: 36, md: 44 },
                  bottom: { xs: 36, md: 44 },
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 1,
                }}
              >
                {[
                  ['01', t({ he: 'חד עיני', en: 'MONO' })],
                  ['02', t({ he: 'דו עיני', en: 'BINO' })],
                  ['03', t({ he: 'פנורמי', en: 'PANO' })],
                ].map(([number, label]) => (
                  <Box
                    key={number}
                    sx={{
                      px: { xs: 1, sm: 1.5 },
                      py: 1.25,
                      bgcolor: 'rgba(3,11,17,0.72)',
                      border: '1px solid rgba(79,195,247,0.24)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#b8ff3d',
                        fontFamily: 'var(--mono)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                      }}
                    >
                      {number}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.25,
                        color: '#eefaff',
                        fontFamily: language === 'en' ? 'var(--mono)' : 'inherit',
                        fontSize: { xs: '0.74rem', sm: '0.83rem' },
                        fontWeight: 850,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 3,
          mt: { xs: -5, md: -6 },
        }}
      >
        <Box
          component="nav"
          aria-label={t({ he: 'מסלולים עיקריים', en: 'Primary paths' })}
          data-testid="home-capability-paths"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            bgcolor: isDark ? 'rgba(12,28,40,0.98)' : 'rgba(255,255,255,0.98)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(79,195,247,0.28)' : 'rgba(13,95,138,0.2)',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 24px 70px rgba(0,0,0,0.2)',
          }}
        >
          {capabilityPaths.map((item, index) => {
            const CapabilityIcon = item.icon;

            return (
              <Box
                key={item.id}
                component={RouterLink}
                to={item.path}
                sx={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: '48px minmax(0, 1fr) auto',
                  alignItems: 'center',
                  gap: 1.5,
                  minHeight: 128,
                  px: { xs: 2.5, md: 3 },
                  py: 2.5,
                  color: 'text.primary',
                  textDecoration: 'none',
                  borderInlineEnd: {
                    xs: 0,
                    md: index < capabilityPaths.length - 1 ? '1px solid' : 0,
                  },
                  borderBottom: {
                    xs: index < capabilityPaths.length - 1 ? '1px solid' : 0,
                    md: 0,
                  },
                  borderColor: isDark ? 'rgba(79,195,247,0.16)' : 'rgba(13,95,138,0.14)',
                  transition: 'background-color 180ms ease, transform 180ms ease',
                  '&:hover, &:focus-visible': {
                    bgcolor: isDark ? 'rgba(79,195,247,0.08)' : 'rgba(13,95,138,0.06)',
                    transform: { md: 'translateY(-3px)' },
                    outline: 'none',
                    '& .capability-arrow': {
                      color: isDark ? '#b8ff3d' : '#2d6500',
                      transform: isRtl ? 'translateX(-3px) scaleX(-1)' : 'translateX(3px)',
                    },
                  },
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                    '&:hover, &:focus-visible': { transform: 'none' },
                  },
                  ...focusRing(isDark ? '#b8ff3d' : '#2d6500', -3),
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 46,
                    height: 46,
                    color: isDark ? '#4fc3f7' : '#0d5f8a',
                    border: '1px solid currentColor',
                    borderRadius: 1.25,
                  }}
                >
                  <CapabilityIcon />
                </Box>
                <Box>
                  <Typography
                    component="p"
                    sx={{
                      color: isDark ? '#b8ff3d' : '#2d6500',
                      fontFamily: 'var(--mono)',
                      fontSize: '0.67rem',
                      fontWeight: 900,
                    }}
                  >
                    {item.number}
                  </Typography>
                  <Typography component="h2" sx={{ mt: 0.25, fontSize: '1.05rem', fontWeight: 850 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ mt: 0.4, color: 'text.secondary', fontSize: '0.83rem' }}>
                    {item.description}
                  </Typography>
                </Box>
                <ArrowForward
                  className="capability-arrow"
                  sx={{
                    color: 'text.secondary',
                    transform: isRtl ? 'scaleX(-1)' : 'none',
                    transition: 'transform 160ms ease, color 160ms ease',
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </Container>

      <Box component="section" aria-labelledby="systems-heading" sx={{ py: { xs: 10, md: 15 } }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', md: 'flex-end' },
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              mb: 5,
            }}
          >
            <Box sx={{ maxWidth: 760, textAlign: 'start' }}>
              <SectionLabel color={isDark ? '#4fc3f7' : '#0d5f8a'}>
                {t({ he: 'CATALOG / 01', en: 'CATALOG / 01' })}
              </SectionLabel>
              <Typography
                id="systems-heading"
                component="h2"
                sx={{
                  mt: 1.5,
                  fontSize: { xs: '2.15rem', md: '3.8rem' },
                  fontWeight: 900,
                  lineHeight: 1.02,
                  letterSpacing: '-0.035em',
                }}
              >
                {t({ he: 'מערכות ורכיבים במקום אחד.', en: 'Explore systems and components.' })}
              </Typography>
              <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: '1.05rem' }}>
                {t({
                  he: 'עברו בין סוגי מערכות, רכיבים ומפרטים טכניים.',
                  en: 'Move between system types, components and technical specifications.',
                })}
              </Typography>
            </Box>

            <Button
              component={RouterLink}
              to="/products"
              endIcon={<ArrowForward sx={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />}
              sx={{
                minHeight: 48,
                color: isDark ? '#b8ff3d' : '#2d6500',
                fontWeight: 850,
                ...focusRing(isDark ? '#b8ff3d' : '#2d6500'),
              }}
            >
              {t({ he: 'כל הקטגוריות', en: 'All categories' })}
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {featuredCategories.map((category, index) => {
              const CategoryIcon = category.icon;
              const media = categoryMedia[category.value];

              return (
                <Box
                  key={category.id}
                  component={RouterLink}
                  to={category.path}
                  sx={{
                    position: 'relative',
                    minHeight: { xs: 330, md: index % 2 === 0 ? 430 : 390 },
                    mt: { lg: index % 2 === 0 ? 0 : 5 },
                    color: '#f4fbff',
                    textDecoration: 'none',
                    border: '1px solid rgba(79,195,247,0.2)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: '#07131e',
                    boxShadow: '0 18px 42px rgba(0,0,0,0.17)',
                    transition: 'transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
                    '&:hover, &:focus-visible': {
                      transform: 'translateY(-7px)',
                      borderColor: '#4fc3f7',
                      boxShadow: '0 26px 62px rgba(0,0,0,0.28)',
                      outline: 'none',
                      '& .category-media': {
                        transform: 'scale(1.035)',
                        filter: 'saturate(0.95) contrast(1.08)',
                      },
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                      '&:hover, &:focus-visible': {
                        transform: 'none',
                        '& .category-media': { transform: 'none' },
                      },
                    },
                    ...focusRing(),
                  }}
                >
                  <img
                    className="category-media"
                    src={media.src}
                    alt=""
                    width={media.width}
                    height={media.height}
                    loading="lazy"
                    decoding="async"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: media.position,
                      filter: 'saturate(0.82) contrast(1.06)',
                      transition: 'transform 360ms ease, filter 260ms ease',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(1,6,10,0.97) 8%, rgba(1,6,10,0.66) 48%, rgba(1,6,10,0.1) 78%)',
                    }}
                  />
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: 20,
                      insetInlineStart: 20,
                      color: '#b8ff3d',
                      fontFamily: 'var(--mono)',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Typography>

                  <Box
                    sx={{
                      position: 'absolute',
                      insetInline: 0,
                      bottom: 0,
                      p: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        placeItems: 'center',
                        width: 42,
                        height: 42,
                        mb: 1.5,
                        color: '#4fc3f7',
                        border: '1px solid rgba(79,195,247,0.48)',
                        borderRadius: 1,
                        bgcolor: 'rgba(3,11,17,0.62)',
                      }}
                    >
                      <CategoryIcon />
                    </Box>
                    <Typography component="h3" sx={{ fontSize: '1.35rem', fontWeight: 900 }}>
                      {t(category.label)}
                    </Typography>
                    <Typography sx={{ mt: 0.7, color: '#b7cbd6', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {t(category.description)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        aria-labelledby="builder-heading"
        sx={{
          py: { xs: 9, md: 13 },
          bgcolor: isDark ? '#0c1b27' : '#ffffff',
          borderBlock: '1px solid',
          borderColor: isDark ? 'rgba(79,195,247,0.14)' : 'rgba(13,95,138,0.12)',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.9fr) minmax(0, 1.1fr)' },
              gap: { xs: 6, lg: 10 },
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                minHeight: { xs: 340, md: 540 },
                overflow: 'hidden',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: isDark ? 'rgba(79,195,247,0.26)' : 'rgba(13,95,138,0.2)',
                bgcolor: '#06111b',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(135deg, rgba(3,10,16,0.08), rgba(3,10,16,0.2) 55%, rgba(3,10,16,0.82))',
                },
              }}
            >
              <Box
                component="svg"
                viewBox="0 0 640 460"
                role="img"
                aria-label={t({
                  he: 'תרשים סכמטי של בחירת רכיבים ותצורות למכשיר ראיית לילה',
                  en: 'Schematic of night vision component and form-factor selection',
                })}
                lang="en"
                preserveAspectRatio="xMidYMid meet"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                }}
              >
                <defs>
                  <pattern id="builder-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#4fc3f7" strokeWidth="0.7" opacity="0.22" />
                  </pattern>
                  <filter id="builder-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="builder-surface" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#06111b" />
                    <stop offset="100%" stopColor="#0c2938" />
                  </linearGradient>
                </defs>

                <rect width="640" height="460" fill="url(#builder-surface)" />
                <rect width="640" height="460" fill="url(#builder-grid)" />
                <path d="M 38 62 H 602 M 38 344 H 602" stroke="#4fc3f7" strokeWidth="1" opacity="0.28" />

                <g fill="none" stroke="#4fc3f7" strokeWidth="2">
                  <circle cx="104" cy="200" r="58" />
                  <circle cx="104" cy="200" r="42" opacity="0.55" />
                  <path d="M 162 173 H 208 V 227 H 162" />
                  <circle cx="252" cy="200" r="43" />
                  <circle cx="252" cy="200" r="27" opacity="0.5" />
                  <path d="M 295 164 H 414 L 446 186 V 214 L 414 236 H 295 Z" />
                  <path d="M 338 164 V 236 M 376 164 V 236" opacity="0.45" />
                  <circle cx="505" cy="200" r="48" />
                  <circle cx="505" cy="200" r="31" opacity="0.5" />
                  <path d="M 446 174 H 468 M 446 226 H 468" />
                </g>

                <path
                  d="M 46 200 H 594"
                  fill="none"
                  stroke="#b8ff3d"
                  strokeWidth="1.4"
                  strokeDasharray="7 8"
                  opacity="0.75"
                  filter="url(#builder-glow)"
                />
                <g fill="#9ddfff" fontFamily="monospace" fontSize="10" letterSpacing="1">
                  <text x="62" y="112">OBJECTIVE</text>
                  <text x="211" y="112">INTENSIFIER</text>
                  <text x="341" y="112">HOUSING</text>
                  <text x="478" y="112">EYEPIECE</text>
                </g>

                <g transform="translate(62 372)" fill="none" stroke="#b8ff3d" strokeWidth="1.7">
                  <circle cx="20" cy="20" r="15" />
                  <path d="M 35 20 H 62" />
                  <text x="0" y="62" fill="#dfffad" stroke="none" fontFamily="monospace" fontSize="10">MONO</text>
                </g>
                <g transform="translate(252 372)" fill="none" stroke="#b8ff3d" strokeWidth="1.7">
                  <circle cx="11" cy="20" r="15" />
                  <circle cx="49" cy="20" r="15" />
                  <path d="M 26 20 H 34" />
                  <text x="5" y="62" fill="#dfffad" stroke="none" fontFamily="monospace" fontSize="10">BINO</text>
                </g>
                <g transform="translate(472 372)" fill="none" stroke="#b8ff3d" strokeWidth="1.7">
                  <circle cx="0" cy="20" r="12" />
                  <circle cx="27" cy="20" r="12" />
                  <circle cx="54" cy="20" r="12" />
                  <circle cx="81" cy="20" r="12" />
                  <text x="15" y="62" fill="#dfffad" stroke="none" fontFamily="monospace" fontSize="10">PANO</text>
                </g>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  zIndex: 2,
                  insetInlineStart: 28,
                  bottom: 28,
                  px: 2,
                  py: 1.5,
                  color: '#eefaff',
                  bgcolor: 'rgba(3,11,17,0.78)',
                  border: '1px solid rgba(184,255,61,0.34)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <SectionLabel color="#b8ff3d">CONFIGURATOR / 03 FORM FACTORS</SectionLabel>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'start' }}>
              <SectionLabel color={isDark ? '#4fc3f7' : '#0d5f8a'}>
                {t({ he: 'BUILDER / 02', en: 'BUILDER / 02' })}
              </SectionLabel>
              <Typography
                id="builder-heading"
                component="h2"
                sx={{
                  mt: 1.5,
                  fontSize: { xs: '2.2rem', md: '4.1rem' },
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}
              >
                {t({ he: 'מתכננים לפני שמתקדמים.', en: 'Plan before moving forward.' })}
              </Typography>
              <Typography
                sx={{
                  maxWidth: 690,
                  mt: 2.5,
                  color: 'text.secondary',
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                }}
              >
                {t({
                  he: 'השוו תצורות חד עיניות, דו עיניות ופנורמיות, ולאחר מכן בחרו גוף, מגבר אור, אופטיקה ורכיבים נלווים בתהליך אחד.',
                  en: 'Compare monocular, binocular and panoramic form factors, then select a housing, image intensifier, optics and supporting components in one configurator.',
                })}
              </Typography>

              <Stack
                component="ol"
                spacing={0}
                sx={{
                  mt: 4,
                  mb: 0,
                  p: 0,
                  listStyle: 'none',
                  borderBlockStart: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {builderSteps.map((step, index) => (
                  <Box
                    component="li"
                    key={step}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '48px minmax(0, 1fr)',
                      alignItems: 'center',
                      gap: 2,
                      minHeight: 68,
                      borderBlockEnd: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      sx={{
                        color: isDark ? '#b8ff3d' : '#2d6500',
                        fontFamily: 'var(--mono)',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Typography>
                    <Typography sx={{ fontWeight: 800 }}>{step}</Typography>
                  </Box>
                ))}
              </Stack>

              <Button
                component={RouterLink}
                to="/builder"
                variant="contained"
                startIcon={<Build />}
                endIcon={<ArrowForward sx={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />}
                sx={{
                  minHeight: 52,
                  mt: 4,
                  px: 3,
                  color: '#102000',
                  bgcolor: '#b8ff3d',
                  fontWeight: 900,
                  '&:hover': { bgcolor: '#caff70' },
                  ...focusRing(isDark ? '#b8ff3d' : '#2d6500'),
                }}
              >
                {t({ he: 'פתחו את בונה המכשירים', en: 'Open the device builder' })}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        aria-labelledby="lab-heading"
        sx={{
          position: 'relative',
          py: { xs: 10, md: 14 },
          color: '#edf9ff',
          bgcolor: '#040b11',
          backgroundImage:
            'radial-gradient(circle at 14% 20%, rgba(184,255,61,0.08), transparent 24%), radial-gradient(circle at 86% 70%, rgba(79,195,247,0.12), transparent 30%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            opacity: 0.16,
            backgroundImage:
              'linear-gradient(rgba(79,195,247,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(79,195,247,0.16) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(300px, 0.76fr) minmax(0, 1.24fr)' },
              gap: { xs: 6, lg: 10 },
              alignItems: 'start',
            }}
          >
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 'calc(var(--site-header-height) + 48px)' }, textAlign: 'start' }}>
              <SectionLabel color="#b8ff3d">{t({ he: 'LAB / 03', en: 'LAB / 03' })}</SectionLabel>
              <Typography
                id="lab-heading"
                component="h2"
                sx={{
                  mt: 1.5,
                  fontSize: { xs: '2.2rem', md: '3.8rem' },
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}
              >
                {t({
                  he: 'תחזוקה, כיול ותיקון.',
                  en: 'Maintenance, calibration and repair.',
                })}
              </Typography>
              <Typography sx={{ mt: 2.5, color: '#a8becb', fontSize: '1.05rem', lineHeight: 1.7 }}>
                {t({
                  he: 'שירותי מעבדה למכשירי ראיית לילה, מרגע הבדיקה ועד הטיפול ברכיבים.',
                  en: 'A lab-service path for night vision devices, from initial checks to component work.',
                })}
              </Typography>
              <Button
                data-testid="lab-services-cta"
                component={RouterLink}
                to="/services"
                endIcon={<ArrowForward sx={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />}
                sx={{
                  minHeight: 50,
                  mt: 3,
                  px: 0,
                  color: '#b8ff3d',
                  fontWeight: 900,
                  '&:hover': { bgcolor: 'transparent', color: '#dfffad' },
                  ...focusRing(),
                }}
              >
                {t({ he: 'לכל שירותי המעבדה', en: 'Explore lab services' })}
              </Button>
            </Box>

            <Stack component="ul" spacing={1.5} sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {labServices.map((service) => {
                const ServiceIcon = service.icon;

                return (
                  <Box
                    component="li"
                    key={service.number}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '52px minmax(0, 1fr)', sm: '76px 56px minmax(0, 1fr)' },
                      alignItems: 'center',
                      gap: { xs: 1.5, sm: 2.5 },
                      minHeight: { xs: 150, sm: 132 },
                      px: { xs: 2.5, sm: 3.5 },
                      py: 2.5,
                      border: '1px solid rgba(79,195,247,0.18)',
                      bgcolor: 'rgba(10,25,36,0.72)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#b8ff3d',
                        fontFamily: 'var(--mono)',
                        fontSize: '0.76rem',
                        fontWeight: 900,
                      }}
                    >
                      {service.number}
                    </Typography>
                    <Box
                      sx={{
                        display: { xs: 'none', sm: 'grid' },
                        placeItems: 'center',
                        width: 52,
                        height: 52,
                        color: '#4fc3f7',
                        border: '1px solid rgba(79,195,247,0.38)',
                        borderRadius: 1,
                      }}
                    >
                      <ServiceIcon />
                    </Box>
                    <Box>
                      <Typography component="h3" sx={{ fontSize: '1.25rem', fontWeight: 900 }}>
                        {service.title}
                      </Typography>
                      <Typography sx={{ mt: 0.7, color: '#a8becb', lineHeight: 1.6 }}>
                        {service.description}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Container>
      </Box>

      <Box component="section" aria-labelledby="contact-heading" sx={{ py: { xs: 8, md: 11 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              position: 'relative',
              px: { xs: 3, md: 6 },
              py: { xs: 5, md: 6 },
              color: isDark ? '#eefaff' : '#07131e',
              bgcolor: isDark ? '#102636' : '#dff3ff',
              border: '1px solid',
              borderColor: isDark ? 'rgba(79,195,247,0.3)' : 'rgba(13,95,138,0.24)',
              borderRadius: 2.5,
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: 220,
                height: 220,
                insetInlineEnd: -70,
                bottom: -100,
                borderRadius: '50%',
                border: '44px solid rgba(184,255,61,0.12)',
                pointerEvents: 'none',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 810, textAlign: 'start' }}>
              <SectionLabel color={isDark ? '#b8ff3d' : '#2d6500'}>
                {t({ he: 'CONTACT / NEXT STEP', en: 'CONTACT / NEXT STEP' })}
              </SectionLabel>
              <Typography
                id="contact-heading"
                component="h2"
                sx={{
                  mt: 1.5,
                  fontSize: { xs: '2rem', md: '3.35rem' },
                  fontWeight: 900,
                  lineHeight: 1.04,
                  letterSpacing: '-0.035em',
                }}
              >
                {t({ he: 'לא בטוחים מאיפה להתחיל?', en: 'Not sure where to start?' })}
              </Typography>
              <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: '1.03rem', lineHeight: 1.65 }}>
                {t({
                  he: 'ספרו לנו אם אתם מחפשים מערכת, רכיבים או שירות מעבדה.',
                  en: 'Tell us whether you need a system, components or lab service.',
                })}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.5 }}>
                <Button
                  data-testid="contact-whatsapp-cta"
                  component="a"
                  href="https://wa.me/972544770200"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  startIcon={<WhatsApp />}
                  sx={{
                    minHeight: 50,
                    px: 3,
                    color: '#102000',
                    bgcolor: '#b8ff3d',
                    fontWeight: 900,
                    '&:hover': { bgcolor: '#caff70' },
                    ...focusRing(isDark ? '#b8ff3d' : '#2d6500'),
                  }}
                >
                  {t({ he: 'WhatsApp', en: 'WhatsApp' })}
                </Button>
                <Button
                  component={RouterLink}
                  to="/contact"
                  variant="outlined"
                  sx={{
                    minHeight: 50,
                    px: 3,
                    color: 'text.primary',
                    borderColor: isDark ? 'rgba(157,223,255,0.48)' : 'rgba(13,95,138,0.42)',
                    fontWeight: 850,
                    ...focusRing(isDark ? '#b8ff3d' : '#2d6500'),
                  }}
                >
                  {t({ he: 'צרו קשר', en: 'Contact us' })}
                </Button>
              </Stack>

              <Typography
                sx={{
                  mt: 3,
                  color: 'text.secondary',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.76rem',
                  lineHeight: 1.65,
                }}
              >
                {t({
                  he: 'תשלום לא מתבצע באתר. נציג שלנו ייצור איתכם קשר לסיום ההזמנה ותיאום משלוח.',
                  en: 'No payment is processed online. We will contact you to finalize your order and arrange delivery.',
                })}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;
