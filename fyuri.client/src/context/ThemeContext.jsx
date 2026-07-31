import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme } from '@mui/material';

const ThemeContext = createContext();

// Context hooks intentionally live beside their provider.
// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
};

export const ThemeModeProvider = ({ children }) => {
  // Initialize from localStorage or default to 'dark'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'dark';
  });

  // Persist theme changes to localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
          // Inspired by white-phosphor night vision optics (icy blue-white glow)
          primary: {
            main: mode === 'dark' ? '#4fc3f7' : '#0d47a1',
            light: mode === 'dark' ? '#8fdcff' : '#5472d3',
            dark: mode === 'dark' ? '#0093c4' : '#002171',
          },
          secondary: {
            main: mode === 'dark' ? '#b0bec5' : '#37474f',
          },
          background: {
            default: mode === 'dark' ? '#0a1622' : '#eef3f8',
            paper: mode === 'dark' ? '#111f2e' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#e8f4fb' : '#0d1b2a',
            secondary: mode === 'dark' ? '#9db4c4' : '#4a5a68',
          },
        },
        typography: {
          fontFamily: '"Segoe UI", "Noto Sans Hebrew", Arial, sans-serif',
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
