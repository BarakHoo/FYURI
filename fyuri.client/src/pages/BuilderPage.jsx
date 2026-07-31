import { useMemo, useState } from 'react';
import {
  AddShoppingCart,
  Architecture,
  Check,
  CheckCircle,
  Close,
  ErrorOutline,
  RestartAlt,
  ViewInAr,
} from '@mui/icons-material';
import {
  Alert,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Device3D from '../components/builder/Device3D';
import PublicPageShell from '../components/PublicPageShell';
import { BuilderProvider, useBuilder } from '../context/BuilderContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import {
  builderCategories,
  deviceTypes,
  getComponentQuantity,
  getOptionsForDevice,
} from '../data/builderData';
import './EquipmentPages.css';

const ACCENT = '#42baf2';
const BLUEPRINT_LINE = 'rgba(198, 216, 227, 0.62)';

const formatPrice = (value, language) => (
  `₪${new Intl.NumberFormat(language === 'he' ? 'he-IL' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`
);

function BlueprintScene() {
  const { language, t } = useLanguage();
  const {
    selections,
    activeCategory,
    setActiveCategory,
    hoveredCategory,
    setHoveredCategory,
    deviceType,
  } = useBuilder();

  const categories = useMemo(() => (
    builderCategories.filter(
      (category) => getOptionsForDevice(category, deviceType).length > 0,
    )
  ), [deviceType]);
  const isHighlighted = (categoryId) => (
    hoveredCategory === categoryId || activeCategory === categoryId
  );

  return (
    <div className="builder-blueprint" dir="ltr">
      <svg
        viewBox="0 0 1000 600"
        role="img"
        aria-label={t({
          he: 'תרשים טכני של מכשיר ראיית לילה',
          en: 'Technical blueprint of a night vision device',
        })}
      >
        <defs>
          <pattern id="equipment-blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(66,186,242,0.08)"
              strokeWidth="1"
            />
          </pattern>
          <filter id="equipment-blueprint-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1000" height="600" fill="#041018" />
        <rect width="1000" height="600" fill="url(#equipment-blueprint-grid)" />
        <text x="42" y="48" fill="rgba(198,216,227,.46)" fontSize="14" letterSpacing="3">
          FYURI / OPTICAL ASSEMBLY / REV 01
        </text>
        <text x="958" y="48" textAnchor="end" fill="rgba(66,186,242,.72)" fontSize="13">
          {deviceType.toUpperCase()}
        </text>

        <g stroke={BLUEPRINT_LINE} strokeWidth="1.5" fill="rgba(6,24,34,.56)">
          <g
            style={{
              stroke: isHighlighted('objective') ? ACCENT : BLUEPRINT_LINE,
              filter: isHighlighted('objective') ? 'url(#equipment-blueprint-glow)' : 'none',
            }}
          >
            <rect x="300" y="260" width="65" height="80" rx="4" />
            <circle cx="332" cy="300" r="23" />
            <circle cx="332" cy="300" r="13" />
          </g>
          <g
            style={{
              stroke: isHighlighted('housing') ? ACCENT : BLUEPRINT_LINE,
              filter: isHighlighted('housing') ? 'url(#equipment-blueprint-glow)' : 'none',
            }}
          >
            <rect x="365" y="245" width="250" height="110" rx="8" />
            <path d="M405 245v110M568 245v110M385 275h210M385 325h210" opacity=".45" />
          </g>
          <g
            style={{
              stroke: isHighlighted('tube') ? ACCENT : BLUEPRINT_LINE,
              filter: isHighlighted('tube') ? 'url(#equipment-blueprint-glow)' : 'none',
            }}
          >
            <rect x="425" y="277" width="125" height="46" rx="5" strokeDasharray="7 5" />
            <path d="M443 289h89M443 311h89" opacity=".55" />
          </g>
          <g
            style={{
              stroke: isHighlighted('eyepiece') ? ACCENT : BLUEPRINT_LINE,
              filter: isHighlighted('eyepiece') ? 'url(#equipment-blueprint-glow)' : 'none',
            }}
          >
            <rect x="615" y="268" width="58" height="64" rx="4" />
            <circle cx="644" cy="300" r="18" />
          </g>
          <g
            style={{
              stroke: isHighlighted('battery') ? ACCENT : BLUEPRINT_LINE,
              filter: isHighlighted('battery') ? 'url(#equipment-blueprint-glow)' : 'none',
            }}
          >
            <rect x="492" y="210" width="55" height="35" rx="4" />
            <path d="M505 210v-9h29v9" />
          </g>
          <g
            style={{
              stroke: isHighlighted('mount') ? ACCENT : BLUEPRINT_LINE,
              filter: isHighlighted('mount') ? 'url(#equipment-blueprint-glow)' : 'none',
            }}
          >
            <rect x="448" y="355" width="105" height="28" rx="3" />
            <path d="M465 355v28M490 355v28M515 355v28M540 355v28" opacity=".58" />
          </g>
          <g
            style={{
              stroke: isHighlighted('illuminator') ? ACCENT : BLUEPRINT_LINE,
              filter: isHighlighted('illuminator') ? 'url(#equipment-blueprint-glow)' : 'none',
            }}
          >
            <rect x="380" y="214" width="42" height="28" rx="4" />
            <path d="M380 220l-14 8 14 8" />
          </g>
        </g>

        {categories.map((category) => {
          const highlighted = isHighlighted(category.id);
          const selected = Boolean(selections[category.id]);
          const { anchor, label } = category;
          const midX = label.x > anchor.x ? label.x - 60 : label.x + 60;
          const name = language === 'he' ? category.nameHe : category.nameEn;

          return (
            <g key={category.id} aria-hidden="true">
              <path
                d={`M ${anchor.x} ${anchor.y} L ${midX} ${label.y} L ${label.x} ${label.y}`}
                fill="none"
                stroke={highlighted ? ACCENT : 'rgba(198,216,227,.34)'}
                strokeWidth={highlighted ? 2 : 1}
              />
              <circle
                cx={anchor.x}
                cy={anchor.y}
                r={highlighted ? 5 : 3.5}
                fill={highlighted ? ACCENT : 'rgba(198,216,227,.7)'}
              />
              <rect
                x={label.x - 78}
                y={label.y - 19}
                width="156"
                height="38"
                rx="3"
                fill={highlighted ? 'rgba(66,186,242,.14)' : 'rgba(5,20,29,.88)'}
                stroke={selected || highlighted ? ACCENT : 'rgba(198,216,227,.28)'}
              />
              <text
                x={label.x}
                y={label.y + 5}
                textAnchor="middle"
                fill={selected || highlighted ? ACCENT : 'rgba(229,238,244,.88)'}
                fontSize="14"
                fontFamily="Roboto, Noto Sans Hebrew, sans-serif"
              >
                {name}
              </text>
            </g>
          );
        })}
      </svg>

      <div
        className="builder-blueprint-controls"
        aria-label={t({ he: 'בחירת רכיב בתרשים', en: 'Blueprint component selection' })}
      >
        {categories.map((category) => {
          const selected = Boolean(selections[category.id]);
          const active = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              className={active ? 'is-active' : undefined}
              aria-pressed={active}
              onClick={() => setActiveCategory(active ? null : category.id)}
              onFocus={() => setHoveredCategory(category.id)}
              onBlur={() => setHoveredCategory(null)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {selected && <Check aria-hidden="true" />}
              <span>{language === 'he' ? category.nameHe : category.nameEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConfigPanel() {
  const { t, language } = useLanguage();
  const {
    activeCategory,
    setActiveCategory,
    selections,
    selectOption,
    deviceType,
  } = useBuilder();

  if (!activeCategory) return null;
  const category = builderCategories.find((candidate) => candidate.id === activeCategory);
  if (!category) return null;

  const options = getOptionsForDevice(category, deviceType);
  const componentQuantity = getComponentQuantity(deviceType, category.id);
  const perChannelNote = category.perChannel && componentQuantity > 1;
  const categoryName = language === 'he' ? category.nameHe : category.nameEn;

  return (
    <Paper
      component="section"
      className="equipment-config-panel"
      aria-label={t({
        he: `אפשרויות עבור ${categoryName}`,
        en: `${categoryName} options`,
      })}
      elevation={12}
    >
      <header className="equipment-config-panel__header">
        <div>
          <span>{t({ he: 'בחירת רכיב', en: 'COMPONENT SELECT' })}</span>
          <h2>{categoryName}</h2>
        </div>
        <IconButton
          size="small"
          onClick={() => setActiveCategory(null)}
          aria-label={t({
            he: `סגירת אפשרויות ${categoryName}`,
            en: `Close ${categoryName} options`,
          })}
        >
          <Close fontSize="small" />
        </IconButton>
      </header>

      {perChannelNote && (
        <p className="equipment-config-panel__note">
          {t({
            he: `המחיר והמשקל כוללים ${componentQuantity} יחידות בתצורה זו.`,
            en: `Price and weight include ×${componentQuantity} for this configuration.`,
          })}
        </p>
      )}

      <div className="equipment-option-list">
        {options.map((option) => {
          const isSelected = selections[category.id] === option.id;
          const optionName = language === 'he' ? option.nameHe : option.nameEn;
          return (
            <button
              key={option.id}
              type="button"
              className={`equipment-option-button${isSelected ? ' is-selected' : ''}`}
              onClick={() => selectOption(category.id, option.id)}
              disabled={!option.available}
              aria-pressed={isSelected}
            >
              <span className="equipment-option-button__copy">
                <strong>{optionName}</strong>
                <small>{language === 'he' ? option.specsHe : option.specsEn}</small>
                {(option.gen || option.fom || option.phosphor) && (
                  <span className="equipment-option-button__chips">
                    {option.gen && <i>{option.gen}</i>}
                    {option.fom && <i>FOM {option.fom}</i>}
                    {option.phosphor && (
                      <i>
                        {option.phosphor === 'white'
                          ? t({ he: 'זרחן לבן', en: 'White phosphor' })
                          : t({ he: 'זרחן ירוק', en: 'Green phosphor' })}
                      </i>
                    )}
                  </span>
                )}
              </span>
              <span className="equipment-option-button__metrics">
                <strong>{formatPrice(option.price, language)}</strong>
                {componentQuantity > 1 && <small>×{componentQuantity}</small>}
                {option.weightGrams > 0 && <small>{option.weightGrams}g</small>}
                {!option.available && (
                  <em>{t({ he: 'לא זמין', en: 'Unavailable' })}</em>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </Paper>
  );
}

function SummaryCard() {
  const { t, language } = useLanguage();
  const { summary, resetBuild, deviceType } = useBuilder();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const {
    totalPrice,
    totalWeight,
    selectedParts,
    allAvailable,
    missingRequired,
    tubeCount,
  } = summary;
  const buildIncomplete = missingRequired.length > 0;

  const handleAddToCart = async () => {
    if (selectedParts.length === 0 || buildIncomplete || !allAvailable || adding) return;
    setSubmissionError('');
    setAdding(true);
    let failureStage = 'build';

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
      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Build request failed (${response.status})`);
      }

      const customProduct = await response.json();
      failureStage = 'cart';
      const added = await addToCart(customProduct);
      if (!added) throw new Error('The configured device was not added to the cart.');
    } catch (error) {
      console.error('Failed to add custom build to cart:', error);
      const message = failureStage === 'cart'
        ? t({
          he: 'התצורה נוצרה, אך לא נוספה לסל. נסו שוב.',
          en: 'The configuration was created but could not be added to your cart. Please try again.',
        })
        : t({
          he: 'לא הצלחנו ליצור את התצורה. בדקו את הבחירות ונסו שוב.',
          en: 'We could not create this configuration. Check your selections and try again.',
        });
      setSubmissionError(
        language === 'en' && error instanceof Error
          ? `${message} ${error.message}`
          : message,
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <Paper component="aside" className="equipment-builder-summary">
      <header>
        <span>{t({ he: 'תצורה חיה', en: 'LIVE CONFIGURATION' })}</span>
        <h2>{t({ he: 'סיכום הרכבה', en: 'Build summary' })}</h2>
      </header>

      {selectedParts.length === 0 ? (
        <p className="equipment-builder-summary__empty">
          {t({
            he: 'בחרו רכיב מסרגל השלבים כדי להתחיל להרכיב את המכשיר.',
            en: 'Choose a component from the step rail to start building your device.',
          })}
        </p>
      ) : (
        <ol className="equipment-builder-parts">
          {selectedParts.map(({ category, option, quantity }) => (
            <li key={category.id}>
              <span>
                <small>{language === 'he' ? category.nameHe : category.nameEn}</small>
                <strong>{language === 'he' ? option.nameHe : option.nameEn}</strong>
              </span>
              <span>
                {quantity > 1 && <small>×{quantity}</small>}
                <strong>{formatPrice(option.price * (quantity ?? 1), language)}</strong>
              </span>
            </li>
          ))}
        </ol>
      )}

      <Divider />

      <dl className="equipment-builder-totals">
        <div>
          <dt>{t({ he: 'סה״כ מחיר', en: 'Total price' })}</dt>
          <dd>{formatPrice(totalPrice, language)}</dd>
        </div>
        <div>
          <dt>{t({ he: 'משקל משוער', en: 'Estimated weight' })}</dt>
          <dd>{totalWeight}g</dd>
        </div>
        <div>
          <dt>{t({ he: 'זמינות', en: 'Availability' })}</dt>
          <dd className={allAvailable ? 'is-available' : 'is-partial'}>
            {allAvailable ? <CheckCircle aria-hidden="true" /> : <ErrorOutline aria-hidden="true" />}
            {allAvailable
              ? t({ he: 'במלאי', en: 'In stock' })
              : t({ he: 'חלקית', en: 'Partial' })}
          </dd>
        </div>
      </dl>

      {buildIncomplete && selectedParts.length > 0 && (
        <Alert severity="warning" className="equipment-inline-alert">
          {t({
            he: `ההרכבה אינה שלמה — חסרים: ${missingRequired
              .map((category) => (
                category.id === 'tube' && tubeCount > 1
                  ? `${category.nameHe} (×${tubeCount})`
                  : category.nameHe
              ))
              .join(', ')}`,
            en: `Build incomplete — missing: ${missingRequired
              .map((category) => (
                category.id === 'tube' && tubeCount > 1
                  ? `${category.nameEn} (×${tubeCount})`
                  : category.nameEn
              ))
              .join(', ')}`,
          })}
        </Alert>
      )}

      {submissionError && (
        <Alert severity="error" className="equipment-inline-alert" role="alert">
          {submissionError}
        </Alert>
      )}

      <div className="equipment-builder-summary__actions">
        <Button
          fullWidth
          startIcon={<RestartAlt />}
          onClick={() => {
            setSubmissionError('');
            resetBuild();
          }}
          variant="outlined"
        >
          {t({ he: 'איפוס הרכבה', en: 'Reset build' })}
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCart />}
          disabled={selectedParts.length === 0 || buildIncomplete || !allAvailable || adding}
          onClick={handleAddToCart}
        >
          {adding
            ? t({ he: 'מוסיף…', en: 'Adding…' })
            : t({ he: 'הוסף לסל', en: 'Add to cart' })}
        </Button>
      </div>
    </Paper>
  );
}

function BuilderContent() {
  const { language, t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    activeCategory,
    deviceType,
    selections,
    setActiveCategory,
    setDeviceType,
    sourcePreset,
  } = useBuilder();
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window === 'undefined') return 'blueprint';
    const constrained = window.matchMedia('(max-width: 899px)').matches
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || navigator.connection?.saveData === true;
    return constrained ? 'blueprint' : '3d';
  });

  const categories = useMemo(() => (
    builderCategories.filter(
      (category) => getOptionsForDevice(category, deviceType).length > 0,
    )
  ), [deviceType]);
  const selectedCount = categories.filter((category) => selections[category.id]).length;
  const device = deviceTypes.find((candidate) => candidate.id === deviceType);

  const handleDeviceTypeChange = (_, nextDeviceType) => {
    if (!nextDeviceType) return;
    setDeviceType(nextDeviceType);
    setActiveCategory(null);
  };

  const handleViewModeChange = (_, nextViewMode) => {
    if (!nextViewMode) return;
    setViewMode(nextViewMode);
    setActiveCategory(null);
  };

  return (
    <PublicPageShell
      eyebrow={t({ he: 'FYURI / מעבדת תצורה', en: 'FYURI / CONFIGURATION LAB' })}
      breadcrumbLabel={t({ he: 'בנה מכשיר', en: 'Build your device' })}
      title={t({ he: 'בנה את מערכת ראיית הלילה שלך', en: 'BUILD YOUR NIGHT VISION DEVICE' })}
      description={t({
        he: 'בחרו פלטפורמה, התאימו כל רכיב ועקבו אחר המחיר, המשקל והזמינות בזמן אמת.',
        en: 'Choose a platform, tune every component, and track price, weight, and availability in real time.',
      })}
      heroImage="/images/banners/catalog-night-ops.webp"
      contentClassName="equipment-page equipment-builder-page"
    >
      <section className="equipment-builder-toolbar" aria-label={t({
        he: 'בקרות תצורה',
        en: 'Configuration controls',
      })}>
        <div className="equipment-builder-toolbar__group">
          <span>{t({ he: '01 / פלטפורמה', en: '01 / PLATFORM' })}</span>
          <ToggleButtonGroup
            value={deviceType}
            exclusive
            onChange={handleDeviceTypeChange}
            aria-label={t({ he: 'סוג מכשיר', en: 'Device type' })}
          >
            {deviceTypes.map((candidate) => (
              <ToggleButton
                key={candidate.id}
                value={candidate.id}
                aria-label={t({ he: candidate.nameHe, en: candidate.nameEn })}
              >
                {t({ he: candidate.nameHe, en: candidate.nameEn })}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <div className="equipment-builder-toolbar__status">
          {sourcePreset && (
            <Chip
              label={t({
                he: `תצורת בסיס: ${sourcePreset.nameHe}`,
                en: `Starting configuration: ${sourcePreset.nameEn}`,
              })}
            />
          )}
          <span>{t({
            he: `${selectedCount} מתוך ${categories.length} רכיבים נבחרו`,
            en: `${selectedCount} of ${categories.length} components selected`,
          })}</span>
        </div>

        <div className="equipment-builder-toolbar__group equipment-builder-toolbar__view">
          <span>{t({ he: '02 / תצוגה', en: '02 / VIEW' })}</span>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label={t({ he: 'מצב תצוגה', en: 'View mode' })}
          >
            <ToggleButton value="3d" aria-label={t({ he: 'תצוגת תלת־ממד', en: '3D view' })}>
              <ViewInAr aria-hidden="true" />
              3D
            </ToggleButton>
            <ToggleButton
              value="blueprint"
              aria-label={t({ he: 'תצוגת תרשים', en: 'Blueprint view' })}
            >
              <Architecture aria-hidden="true" />
              {t({ he: 'תרשים', en: 'Blueprint' })}
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </section>

      <p className="equipment-builder-description">
        <strong>{t({ he: device?.nameHe, en: device?.nameEn })}</strong>
        <span>{t({ he: device?.descriptionHe, en: device?.descriptionEn })}</span>
        {viewMode === '3d' && (
          <span>{t({
            he: 'גררו לסיבוב, גללו להתקרבות, או השתמשו בסרגל השלבים לבחירת רכיב.',
            en: 'Drag to rotate, scroll to zoom, or use the step rail to choose a component.',
          })}</span>
        )}
      </p>

      <div className="equipment-builder-workspace">
        <nav
          className="equipment-builder-step-rail"
          aria-label={t({ he: 'שלבי בניית המכשיר', en: 'Device build steps' })}
        >
          <header>
            <span>{t({ he: 'רכיבים', en: 'COMPONENTS' })}</span>
            <strong>{String(selectedCount).padStart(2, '0')} / {String(categories.length).padStart(2, '0')}</strong>
          </header>
          <ol>
            {categories.map((category, index) => {
              const active = activeCategory === category.id;
              const selection = category.options.find(
                (option) => option.id === selections[category.id],
              );
              return (
                <li key={category.id}>
                  <button
                    type="button"
                    className={active ? 'is-active' : undefined}
                    onClick={() => setActiveCategory(active ? null : category.id)}
                    aria-pressed={active}
                  >
                    <i>{String(index + 1).padStart(2, '0')}</i>
                    <span>
                      <strong>{language === 'he' ? category.nameHe : category.nameEn}</strong>
                      <small>
                        {selection
                          ? (language === 'he' ? selection.nameHe : selection.nameEn)
                          : t({ he: 'לא נבחר', en: 'Not selected' })}
                      </small>
                    </span>
                    {selection && <Check aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="equipment-builder-stage" aria-label={t({
          he: 'תצוגת מכשיר',
          en: 'Device visualization',
        })}>
          <header>
            <span>FYURI / {deviceType.toUpperCase()}</span>
            <span>{viewMode === '3d' ? 'INTERACTIVE MODEL' : 'TECHNICAL BLUEPRINT'}</span>
          </header>
          {viewMode === '3d' ? <Device3D /> : <BlueprintScene />}
          {!isMobile && <ConfigPanel />}
        </section>

        <SummaryCard />
      </div>

      {isMobile && <ConfigPanel />}
    </PublicPageShell>
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
