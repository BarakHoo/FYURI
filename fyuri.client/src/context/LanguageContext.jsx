import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();
const LANGUAGE_STORAGE_KEY = 'fyuri-language';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  try {
    const persistedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return persistedLanguage === 'he' || persistedLanguage === 'en'
      ? persistedLanguage
      : 'en';
  } catch {
    return 'en';
  }
};

// Context hooks intentionally live beside their provider for a single public API.
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Browsers can deny storage in private or locked-down contexts.
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'he' ? 'en' : 'he'));
  };

  const t = (translations) => {
    return translations[language] || translations['en'] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
