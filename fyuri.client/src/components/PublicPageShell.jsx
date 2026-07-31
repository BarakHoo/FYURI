import { Box } from '@mui/material';

function PublicPageShell({
  actions,
  children,
  description,
  eyebrow,
  title,
}) {
  return (
    <Box className="fy-public-page">
      <Box component="section" className="fy-public-hero">
        <Box className="fy-public-hero__inner">
          <Box className="fy-public-hero__copy">
            {eyebrow && <p className="fy-public-eyebrow">{eyebrow}</p>}
            <h1 className="fy-public-title">{title}</h1>
            {description && <p className="fy-public-description">{description}</p>}
          </Box>
          {actions && <Box className="fy-public-hero__actions">{actions}</Box>}
        </Box>
      </Box>
      <Box component="section" className="fy-public-content">
        {children}
      </Box>
    </Box>
  );
}

export default PublicPageShell;
