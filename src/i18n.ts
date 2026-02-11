import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import uk from './locales/uk.json';

export const defaultNS = 'common';
export const supportedLngs = ['en', 'uk'] as const;
export type SupportedLocale = (typeof supportedLngs)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { [defaultNS]: en },
      uk: { [defaultNS]: uk },
    },
    defaultNS,
    fallbackLng: 'en',
    supportedLngs: [...supportedLngs],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
