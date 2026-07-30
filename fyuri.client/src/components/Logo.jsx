import { Box } from '@mui/material';
import { useThemeMode } from '../context/ThemeContext';

function Logo({
  height = 40,
  width = 'auto',
  surface = 'auto',
  markOnly = false,
  alt = 'FYURI Night Vision Systems',
}) {
  const { mode } = useThemeMode();
  const resolvedSurface = surface === 'auto'
    ? (mode === 'dark' ? 'dark' : 'light')
    : surface;
  const assetName = markOnly ? 'fyuri-mark' : 'fyuri-lockup';
  const logoPath = `/brand/${assetName}-on-${resolvedSurface}.svg`;

  return (
    <Box
      component="img"
      src={logoPath}
      alt={alt}
      data-testid="fyuri-logo"
      loading="eager"
      decoding="async"
      draggable={false}
      sx={{
        height,
        width,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}

export default Logo;
