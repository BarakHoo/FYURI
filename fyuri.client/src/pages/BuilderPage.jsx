import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Divider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { Close, RestartAlt, CheckCircle, ErrorOutline, ViewInAr, Architecture, AddShoppingCart } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { BuilderProvider, useBuilder } from '../context/BuilderContext';
import { builderCategories, deviceTypes, getOptionsForDevice, getTubeCount } from '../data/builderData';
import Device3D from '../components/builder/Device3D';

const ACCENT = '#00C8FF';
const BG = '#0B0B0B';
const LINE = 'rgba(255, 255, 255, 0.35)';

const formatPrice = (n) => `₪${n.toLocaleString()}`;

/* ------------------------------------------------------------------ */
/* Schematic monocular scene (SVG blueprint)                           */
/* ------------------------------------------------------------------ */
function BlueprintScene() {
  const { t, language } = useLanguage();
  const {
    selections,
    activeCategory,
    setActiveCategory,
    hoveredCategory,
    setHoveredCategory,
  } = useBuilder();

  const isHighlighted = (id) => hoveredCategory === id || activeCategory === id;

  return (
    <Box
      // Blueprint scene is a technical drawing — always LTR, independent of language
      sx={{ direction: 'ltr', width: '100%' }}
    >
      <svg
        viewBox="0 0 1000 600"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label={t({ he: 'תרשים מכשיר ראיית לילה', en: 'Night vision device blueprint' })}
      >
        <defs>
          <pattern id="bp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,200,255,0.06)" strokeWidth="1" />
          </pattern>
          <filter id="bp-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <style>
            {`
              .bp-line {
                stroke-dasharray: 400;
                stroke-dashoffset: 400;
                animation: bp-draw 1.2s ease forwards;
              }
              @keyframes bp-draw {
                to { stroke-dashoffset: 0; }
              }
              .bp-label {
                cursor: pointer;
                transition: all 0.25s ease;
              }
              .bp-part {
                transition: all 0.25s ease;
              }
              @keyframes bp-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.55; }
              }
              .bp-pulse { animation: bp-pulse 1.4s ease-in-out infinite; }
            `}
          </style>
        </defs>

        {/* Blueprint grid background */}
        <rect width="1000" height="600" fill={BG} />
        <rect width="1000" height="600" fill="url(#bp-grid)" />

        {/* ------ Schematic monocular ------ */}
        <g stroke={LINE} strokeWidth="1.5" fill="none">
          {/* Objective lens */}
          <g
            className="bp-part"
            style={{
              stroke: isHighlighted('objective') ? ACCENT : LINE,
              filter: isHighlighted('objective') ? 'url(#bp-glow)' : 'none',
            }}
          >
            <rect x="310" y="270" width="50" height="60" rx="6" />
            <circle cx="335" cy="300" r="18" />
          </g>

          {/* Main housing body */}
          <g
            className="bp-part"
            style={{
              stroke: isHighlighted('housing') ? ACCENT : LINE,
              filter: isHighlighted('housing') ? 'url(#bp-glow)' : 'none',
            }}
          >
            <rect x="360" y="255" width="250" height="90" rx="14" />
            <line x1="420" y1="255" x2="420" y2="345" />
            <line x1="560" y1="255" x2="560" y2="345" />
          </g>

          {/* Tube (internal, dashed) */}
          <g
            className="bp-part"
            style={{
              stroke: isHighlighted('tube') ? ACCENT : LINE,
              filter: isHighlighted('tube') ? 'url(#bp-glow)' : 'none',
            }}
          >
            <rect x="430" y="280" width="120" height="40" rx="8" strokeDasharray="6 4" />
          </g>

          {/* Eyepiece */}
          <g
            className="bp-part"
            style={{
              stroke: isHighlighted('eyepiece') ? ACCENT : LINE,
              filter: isHighlighted('eyepiece') ? 'url(#bp-glow)' : 'none',
            }}
          >
            <rect x="610" y="275" width="45" height="50" rx="6" />
            <circle cx="632" cy="300" r="14" />
          </g>

          {/* Battery cap on top */}
          <g
            className="bp-part"
            style={{
              stroke: isHighlighted('battery') ? ACCENT : LINE,
              filter: isHighlighted('battery') ? 'url(#bp-glow)' : 'none',
            }}
          >
            <rect x="498" y="228" width="44" height="28" rx="5" />
          </g>

          {/* Mount rail below */}
          <g
            className="bp-part"
            style={{
              stroke: isHighlighted('mount') ? ACCENT : LINE,
              filter: isHighlighted('mount') ? 'url(#bp-glow)' : 'none',
            }}
          >
            <rect x="455" y="345" width="90" height="22" rx="4" />
            <line x1="470" y1="345" x2="470" y2="367" />
            <line x1="490" y1="345" x2="490" y2="367" />
            <line x1="510" y1="345" x2="510" y2="367" />
            <line x1="530" y1="345" x2="530" y2="367" />
          </g>

          {/* Illuminator on the side */}
          <g
            className="bp-part"
            style={{
              stroke: isHighlighted('illuminator') ? ACCENT : LINE,
              filter: isHighlighted('illuminator') ? 'url(#bp-glow)' : 'none',
            }}
          >
            <rect x="382" y="228" width="36" height="24" rx="5" />
            <path d="M 378 240 l -10 -6 v 12 z" />
          </g>
        </g>

        {/* ------ Connector lines + labels ------ */}
        {builderCategories.map((category) => {
          const highlighted = isHighlighted(category.id);
          const selected = Boolean(selections[category.id]);
          const name = language === 'he' ? category.nameHe : category.nameEn;
          const { anchor, label } = category;
          // Elbow connector: horizontal then vertical
          const midX = label.x > anchor.x ? label.x - 60 : label.x + 60;

          return (
            <g key={category.id}>
              <path
                className="bp-line"
                d={`M ${anchor.x} ${anchor.y} L ${midX} ${label.y} L ${label.x} ${label.y}`}
                fill="none"
                stroke={highlighted ? ACCENT : 'rgba(255,255,255,0.25)'}
                strokeWidth={highlighted ? 1.8 : 1}
              />
              <circle
                cx={anchor.x}
                cy={anchor.y}
                r={highlighted ? 5 : 3.5}
                fill={highlighted ? ACCENT : 'rgba(255,255,255,0.5)'}
                className={highlighted ? 'bp-pulse' : undefined}
              />
              <g
                className="bp-label"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => setActiveCategory(category.id)}
              >
                <rect
                  x={label.x - 78}
                  y={label.y - 20}
                  width="156"
                  height="40"
                  rx="10"
                  fill={highlighted ? 'rgba(0,200,255,0.12)' : 'rgba(255,255,255,0.04)'}
                  stroke={selected ? ACCENT : highlighted ? ACCENT : 'rgba(255,255,255,0.2)'}
                  strokeWidth={selected ? 1.6 : 1}
                />
                <text
                  x={label.x}
                  y={label.y + 5}
                  textAnchor="middle"
                  fill={highlighted || selected ? ACCENT : 'rgba(255,255,255,0.85)'}
                  fontSize="15"
                  fontFamily="Roboto, Noto Sans Hebrew, sans-serif"
                >
                  {name}
                </text>
                {selected && (
                  <circle cx={label.x + 68} cy={label.y - 12} r="4.5" fill={ACCENT} />
                )}
              </g>
            </g>
          );
        })}
      </svg>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Floating configuration panel (glassmorphism)                        */
/* ------------------------------------------------------------------ */
function ConfigPanel() {
  const { t, language } = useLanguage();
  const { activeCategory, setActiveCategory, selections, selectOption, deviceType } = useBuilder();

  if (!activeCategory) return null;
  const category = builderCategories.find((c) => c.id === activeCategory);
  if (!category) return null;

  const options = getOptionsForDevice(category, deviceType);
  const tubeCount = getTubeCount(deviceType);
  const perChannelNote = category.perChannel && tubeCount > 1;

  return (
    <Paper
      elevation={12}
      sx={{
        position: { xs: 'fixed', md: 'absolute' },
        bottom: { xs: 0, md: 24 },
        left: { xs: 0, md: '50%' },
        transform: { xs: 'none', md: 'translateX(-50%)' },
        width: { xs: '100%', md: 520 },
        maxHeight: { xs: '60vh', md: 420 },
        overflowY: 'auto',
        zIndex: 20,
        p: 3,
        borderRadius: { xs: '16px 16px 0 0', md: '16px' },
        bgcolor: 'rgba(11, 20, 30, 0.85)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(0, 200, 255, 0.25)',
        color: '#e8f4fb',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color: ACCENT }}>
          {language === 'he' ? category.nameHe : category.nameEn}
        </Typography>
        <IconButton size="small" onClick={() => setActiveCategory(null)} sx={{ color: 'inherit' }}>
          <Close fontSize="small" />
        </IconButton>
      </Stack>

      {perChannelNote && (
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block', mb: 1.5 }}>
          {t({
            he: `המחיר והמשקל מוכפלים ב-${tubeCount} ערוצים`,
            en: `Price & weight are per channel — ×${tubeCount} for this device`,
          })}
        </Typography>
      )}

      <Stack spacing={1.5}>
        {options.map((option) => {
          const isSelected = selections[category.id] === option.id;
          return (
            <Paper
              key={option.id}
              onClick={() => option.available && selectOption(category.id, option.id)}
              sx={{
                p: 2,
                cursor: option.available ? 'pointer' : 'not-allowed',
                opacity: option.available ? 1 : 0.45,
                bgcolor: isSelected ? 'rgba(0,200,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: '1px solid',
                borderColor: isSelected ? ACCENT : 'rgba(255,255,255,0.12)',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                color: 'inherit',
                '&:hover': option.available
                  ? { borderColor: ACCENT, bgcolor: 'rgba(0,200,255,0.08)' }
                  : {},
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {language === 'he' ? option.nameHe : option.nameEn}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {language === 'he' ? option.specsHe : option.specsEn}
                  </Typography>
                  {(option.gen || option.fom) && (
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      {option.gen && (
                        <Chip size="small" label={option.gen} sx={{ height: 18, fontSize: 11, bgcolor: 'rgba(0,200,255,0.1)', color: ACCENT }} />
                      )}
                      {option.fom && (
                        <Chip size="small" label={`FOM ${option.fom}`} sx={{ height: 18, fontSize: 11, bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }} />
                      )}
                      {option.phosphor && (
                        <Chip
                          size="small"
                          label={option.phosphor === 'white' ? t({ he: 'זרחן לבן', en: 'White Phosphor' }) : t({ he: 'זרחן ירוק', en: 'Green Phosphor' })}
                          sx={{
                            height: 18,
                            fontSize: 11,
                            bgcolor: option.phosphor === 'white' ? 'rgba(255,255,255,0.15)' : 'rgba(80,255,140,0.12)',
                            color: option.phosphor === 'white' ? '#e8f4fb' : '#7dffa8',
                          }}
                        />
                      )}
                    </Stack>
                  )}
                </Box>
                <Stack alignItems="flex-end" spacing={0.5}>
                  <Typography variant="subtitle2" sx={{ color: ACCENT }}>
                    {formatPrice(option.price)}
                  </Typography>
                  {!option.available && (
                    <Chip
                      size="small"
                      label={t({ he: 'לא זמין', en: 'Unavailable' })}
                      sx={{ bgcolor: 'rgba(255,80,80,0.15)', color: '#ff9e9e', height: 20 }}
                    />
                  )}
                  {option.weightGrams > 0 && (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      {option.weightGrams}g
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* Live build summary card                                             */
/* ------------------------------------------------------------------ */
function SummaryCard() {
  const { t, language } = useLanguage();
  const { summary, resetBuild, deviceType } = useBuilder();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const { totalPrice, totalWeight, selectedParts, allAvailable, missingRequired, tubeCount } = summary;
  const buildIncomplete = missingRequired.length > 0;

  const handleAddToCart = async () => {
    if (selectedParts.length === 0 || adding) return;
    setAdding(true);
    try {
      const response = await fetch('/api/builder/custom-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceType,
          parts: selectedParts.map(({ category, option }) => ({
            categoryId: category.id,
            optionId: option.id,
          })),
        }),
      });
      if (!response.ok) throw new Error('Failed to create custom build');
      const product = await response.json();
      await addToCart(product);
    } catch (error) {
      console.error('Failed to add custom build to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'rgba(11, 20, 30, 0.75)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 200, 255, 0.2)',
        color: '#e8f4fb',
        height: '100%',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: ACCENT }}>
        {t({ he: 'סיכום הרכבה', en: 'Build Summary' })}
      </Typography>

      {selectedParts.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', my: 2 }}>
          {t({
            he: 'לחץ על רכיב בתרשים כדי להתחיל להרכיב את המכשיר שלך',
            en: 'Click a component on the blueprint to start building your device',
          })}
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ my: 2 }}>
          {selectedParts.map(({ category, option, quantity }) => (
            <Stack key={category.id} direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {language === 'he' ? category.nameHe : category.nameEn}:{' '}
                {language === 'he' ? option.nameHe : option.nameEn}
                {quantity > 1 ? ` ×${quantity}` : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: ACCENT, whiteSpace: 'nowrap' }}>
                {formatPrice(option.price * (quantity ?? 1))}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', my: 2 }} />

      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle2">{t({ he: 'סה"כ מחיר', en: 'Total Price' })}</Typography>
          <Typography variant="subtitle1" sx={{ color: ACCENT, fontWeight: 700 }}>
            {formatPrice(totalPrice)}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle2">{t({ he: 'משקל משוער', en: 'Est. Weight' })}</Typography>
          <Typography variant="body2">{totalWeight}g</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2">{t({ he: 'זמינות', en: 'Availability' })}</Typography>
          {allAvailable ? (
            <Chip
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
              size="small"
              label={t({ he: 'זמין', en: 'In Stock' })}
              sx={{ bgcolor: 'rgba(80,255,140,0.12)', color: '#7dffa8' }}
            />
          ) : (
            <Chip
              icon={<ErrorOutline sx={{ fontSize: 16 }} />}
              size="small"
              label={t({ he: 'חלקית', en: 'Partial' })}
              sx={{ bgcolor: 'rgba(255,190,80,0.12)', color: '#ffd28a' }}
            />
          )}
        </Stack>
      </Stack>

      {buildIncomplete && selectedParts.length > 0 && (
        <Alert
          severity="warning"
          icon={<ErrorOutline sx={{ fontSize: 18 }} />}
          sx={{
            mt: 2,
            bgcolor: 'rgba(255,190,80,0.1)',
            color: '#ffd28a',
            border: '1px solid rgba(255,190,80,0.35)',
            '& .MuiAlert-icon': { color: '#ffd28a' },
          }}
        >
          {t({
            he: `ההרכבה אינה שלמה — חסרים: ${missingRequired
              .map((c) => (c.id === 'tube' && tubeCount > 1 ? `${c.nameHe} (×${tubeCount})` : c.nameHe))
              .join(', ')}`,
            en: `Build incomplete — missing: ${missingRequired
              .map((c) => (c.id === 'tube' && tubeCount > 1 ? `${c.nameEn} (×${tubeCount})` : c.nameEn))
              .join(', ')}`,
          })}
        </Alert>
      )}

      <Button
        fullWidth
        startIcon={<RestartAlt />}
        onClick={resetBuild}
        sx={{
          mt: 3,
          color: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 2,
          '&:hover': { borderColor: ACCENT, color: ACCENT },
        }}
      >
        {t({ he: 'איפוס הרכבה', en: 'Reset Build' })}
      </Button>

      <Button
        fullWidth
        variant="contained"
        startIcon={<AddShoppingCart />}
        disabled={selectedParts.length === 0 || adding}
        onClick={handleAddToCart}
        sx={{
          mt: 1.5,
          bgcolor: ACCENT,
          color: '#04222e',
          fontWeight: 700,
          borderRadius: 2,
          '&:hover': { bgcolor: '#33d4ff' },
        }}
      >
        {adding
          ? t({ he: 'מוסיף...', en: 'Adding...' })
          : t({ he: 'הוסף לעגלה', en: 'Add to Cart' })}
      </Button>
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
function BuilderContent() {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { deviceType, setDeviceType, setActiveCategory } = useBuilder();
  const [viewMode, setViewMode] = useState('3d');

  const handleDeviceTypeChange = (_, v) => {
    if (!v) return;
    setDeviceType(v);
    setActiveCategory(null);
  };

  const handleViewModeChange = (_, v) => {
    if (!v) return;
    setViewMode(v);
    setActiveCategory(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: BG,
        pt: { xs: 14, md: 18 },
        pb: 8,
        px: { xs: 2, md: 6 },
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          color: '#e8f4fb',
          textAlign: 'center',
          fontWeight: 300,
          letterSpacing: 4,
          mb: 1,
        }}
      >
        {t({ he: 'בנה מכשיר ראיית לילה', en: 'BUILD YOUR NIGHT VISION DEVICE' })}
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mb: 5 }}
      >
        {t({
          he: 'בחר רכיבים בתרשים והרכב את התצורה המושלמת עבורך',
          en: 'Select components on the blueprint to configure your perfect setup',
        })}
      </Typography>

      {/* Device type + view mode selectors */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <ToggleButtonGroup
          value={deviceType}
          exclusive
          onChange={handleDeviceTypeChange}
          sx={{
            '& .MuiToggleButton-root': {
              color: 'rgba(255,255,255,0.6)',
              borderColor: 'rgba(255,255,255,0.2)',
              px: 2.5,
              textTransform: 'none',
              '&.Mui-selected': {
                color: ACCENT,
                bgcolor: 'rgba(0,200,255,0.08)',
                borderColor: ACCENT,
              },
            },
          }}
        >
          {deviceTypes.map((dt) => (
            <ToggleButton key={dt.id} value={dt.id}>
              {t({ he: dt.nameHe, en: dt.nameEn })}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              color: 'rgba(255,255,255,0.6)',
              borderColor: 'rgba(255,255,255,0.2)',
              '&.Mui-selected': {
                color: ACCENT,
                bgcolor: 'rgba(0,200,255,0.08)',
                borderColor: ACCENT,
              },
            },
          }}
        >
          <ToggleButton value="3d">
            <ViewInAr sx={{ fontSize: 18, mr: 0.5 }} />
            {t({ he: 'תלת-ממד', en: '3D' })}
          </ToggleButton>
          <ToggleButton value="blueprint">
            <Architecture sx={{ fontSize: 18, mr: 0.5 }} />
            {t({ he: 'תרשים', en: 'Blueprint' })}
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Typography
        variant="caption"
        display="block"
        sx={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', mb: 3 }}
      >
        {t({
          he: deviceTypes.find((d) => d.id === deviceType)?.descriptionHe,
          en: deviceTypes.find((d) => d.id === deviceType)?.descriptionEn,
        })}
        {viewMode === '3d' &&
          ' — ' +
            t({ he: 'גרור לסיבוב, גלול להתקרבות, לחץ על רכיב לבחירה', en: 'Drag to rotate, scroll to zoom, click a part to configure' })}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          maxWidth: 1400,
          mx: 'auto',
          position: 'relative',
        }}
      >
        <Box sx={{ flex: 2.2, position: 'relative' }}>
          {viewMode === '3d' ? <Device3D /> : <BlueprintScene />}
          {!isMobile && <ConfigPanel />}
        </Box>
        <Box sx={{ flex: 1, minWidth: { md: 320 } }}>
          <SummaryCard />
        </Box>
      </Box>
      {isMobile && <ConfigPanel />}
    </Box>
  );
}

function BuilderPage() {
  return (
    <BuilderProvider>
      <BuilderContent />
    </BuilderProvider>
  );
}

export default BuilderPage;
