import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Language } from '../../types';
import translationsData from '../../translations/translations.json';

const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
];

type TranslationsType = Record<string, Record<string, string>>;
const translations: TranslationsType = translationsData as TranslationsType;

interface LanguageState {
    currentLanguage: Language;
    availableLanguages: Language[];
}

const getInitialLanguage = (): Language => {
    const storedLanguage = localStorage.getItem('preferred_language');
    if (storedLanguage) {
        const language = languages.find((lang) => lang.code === storedLanguage);
        if (language) return language;
    }
    return languages[0];
};

const initialState: LanguageState = {
    currentLanguage: getInitialLanguage(),
    availableLanguages: languages,
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<Language>) => {
            state.currentLanguage = action.payload;
            localStorage.setItem('preferred_language', action.payload.code);
        },
    },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;

export const selectCurrentLanguage = (state: { language: LanguageState }) => state.language.currentLanguage;
export const selectAvailableLanguages = (state: { language: LanguageState }) => state.language.availableLanguages;

export const selectTranslation = (state: { language: LanguageState }) => {
    const currentLanguageCode = state.language.currentLanguage.code;
    return (key: string, replacements?: Record<string, string>) => {
        let translation =
            translations[currentLanguageCode]?.[key] || translations.en[key] || key;

        if (replacements) {
            Object.entries(replacements).forEach(([placeholder, value]) => {
                translation = translation.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
            });
        }

        return translation;
    };
};
