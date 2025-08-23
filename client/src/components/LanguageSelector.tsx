'use client'
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, setIsOpen }) => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="font-medium">{currentLanguage.nativeName}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  setLanguage(language);
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 px-4 py-2 text-left w-full hover:bg-gray-50 transition-colors ${
                  currentLanguage.code === language.code
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div>
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-sm text-gray-500">{language.name}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
