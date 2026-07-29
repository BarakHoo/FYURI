/**
 * Format generation number to display string
 * @param {string|number} generation - The generation value (e.g., "2", "3", "Gen 2")
 * @returns {string} - Formatted generation string (e.g., "Gen 2", "Gen 3")
 */
export function formatGeneration(generation) {
  if (!generation) return '';

  const genStr = String(generation).trim();

  // If it already starts with "Gen", return as-is
  if (genStr.toLowerCase().startsWith('gen')) {
    return genStr;
  }

  // Otherwise, it's just a number - format it
  return `Gen ${genStr}`;
}

/**
 * Get the color theme for a generation
 * @param {string|number} generation - The generation value
 * @returns {object} - MUI theme object with color and background
 */
export function getGenerationColor(generation) {
  if (!generation) return { color: 'primary' };

  const genStr = String(generation).trim().toLowerCase();
  const genNumber = genStr.replace(/[^0-9]/g, '');

  switch (genNumber) {
    case '1':
      // Retro green for Gen 1
      return {
        sx: {
          backgroundColor: '#2d5016',
          color: '#b8e986',
          borderColor: '#4a7c2a',
          '&:hover': {
            backgroundColor: '#3d6520',
          },
        },
      };
    case '2':
      // Green for Gen 2
      return {
        sx: {
          backgroundColor: '#1b5e20',
          color: '#a5d6a7',
          borderColor: '#2e7d32',
          '&:hover': {
            backgroundColor: '#2e7d32',
          },
        },
      };
    case '3':
      // Blue for Gen 3 (remains as-is)
      return {
        color: 'primary', // Uses the theme's primary blue
      };
    default:
      return { color: 'primary' };
  }
}
