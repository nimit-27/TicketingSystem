import React, { createContext, useState } from 'react';
import i18n from '../i18n';

interface LanguageContextProps {
  language: string;
  toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  toggleLanguage: () => {},
});

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
