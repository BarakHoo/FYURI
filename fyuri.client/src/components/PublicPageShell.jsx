import { ChevronRight } from '@mui/icons-material';
import { Box } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import CatalogCapabilityStrip from './CatalogCapabilityStrip';
import { useLanguage } from '../context/LanguageContext';

function PublicPageShell({
  actions,
  breadcrumbLabel,
  capabilities = true,
  children,
  contentClassName = '',
  description,
  eyebrow,
  heroImage = '/images/banners/catalog-night-ops.webp',
  heroImageAlt = '',
  heroImagePosition = 'center',
  title,
}) {
  const { t } = useLanguage();
  const resolvedBreadcrumb = breadcrumbLabel || title;

  return (
    <Box className="fy-public-page">
      <Box component="section" className="fy-public-hero">
        {heroImage && (
          <img
            className="fy-public-hero__image"
            src={heroImage}
            alt={heroImageAlt}
            aria-hidden={heroImageAlt ? undefined : 'true'}
            width="1600"
            height="420"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ objectPosition: heroImagePosition }}
          />
        )}
        <Box className="fy-public-hero__shade" aria-hidden="true" />
        <Box className="fy-public-hero__inner">
          <Box className="fy-public-hero__copy">
            <nav
              className="fy-public-breadcrumb"
              aria-label={t({ he: 'פירורי לחם', en: 'Breadcrumb' })}
            >
              <RouterLink to="/">{t({ he: 'בית', en: 'Home' })}</RouterLink>
              <ChevronRight aria-hidden="true" />
              <span>{resolvedBreadcrumb}</span>
            </nav>
            {eyebrow && <p className="fy-public-eyebrow">{eyebrow}</p>}
            <h1 className="fy-public-title">{title}</h1>
            {description && <p className="fy-public-description">{description}</p>}
          </Box>
          {actions && <Box className="fy-public-hero__actions">{actions}</Box>}
        </Box>
      </Box>
      {capabilities && <CatalogCapabilityStrip />}
      <Box className="fy-public-stage">
        <Box
          component="section"
          className={`fy-public-content ${contentClassName}`.trim()}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default PublicPageShell;
