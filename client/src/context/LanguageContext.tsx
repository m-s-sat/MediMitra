// src/context/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types/index.ts';
import translationsData from '../translations/translations.json';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  availableLanguages: Language[];
  t: (key: string, replacements?: Record<string, string>) => string; // updated to allow replacements
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
];
type TranslationsType = Record<string, Record<string, string>>;
// In a real app, these would come from JSON files
const translations: TranslationsType = translationsData as TranslationsType;
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('preferred_language');
    if (storedLanguage) {
      const language = languages.find((lang) => lang.code === storedLanguage);
      if (language) {
        setCurrentLanguage(language);
      }
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred_language', language.code);
  };

  const t = (key: string, replacements?: Record<string, string>) => {
    let translation =
      translations[currentLanguage.code]?.[key] || translations.en[key] || key;

    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
      });
    }

    return translation;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    availableLanguages: languages,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
