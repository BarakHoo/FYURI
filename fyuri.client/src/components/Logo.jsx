import { Box } from '@mui/material';
import { useThemeMode } from '../context/ThemeContext';

function Logo({ height = 40, width = 'auto' }) {
  const { mode } = useThemeMode();

  // Single logo asset (metallic lettering + owl mark) works on both light and dark backgrounds
  const logoPath = '/images/logos/fyuri-logo.png';

  return (
    <Box
      component="img"
      src={logoPath}
      alt="FYURI Night Vision"
      sx={{
        height: height,
        width: width,
        objectFit: 'contain',
        // Fallback to text if image not found
        display: 'block'
      }}
      onError={(e) => {
        // If image fails to load, replace with text
        e.target.style.display = 'none';
        const textElement = document.createElement('span');
        textElement.textContent = 'FYURI';
        textElement.style.fontSize = '24px';
        textElement.style.fontWeight = 'bold';
        textElement.style.color = mode === 'dark' ? '#4fc3f7' : '#0d47a1';
        e.target.parentNode.insertBefore(textElement, e.target);
      }}
    />
  );
}

export default Logo;
