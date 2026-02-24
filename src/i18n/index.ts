import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import ru from './ru.json';
import en from './en.json';

const resources = {
  ru: { translation: ru },
  en: { translation: en },
};

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'ru';
const supportedLanguages = ['ru', 'en'];
const fallbackLanguage = 'ru';

i18n.use(initReactI18next).init({
  resources,
  lng: supportedLanguages.includes(deviceLanguage) ? deviceLanguage : fallbackLanguage,
  fallbackLng: fallbackLanguage,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
