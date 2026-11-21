import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLanguageMeta, LANGUAGES } from './languages';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import bn from '../locales/bn.json';
import mr from '../locales/mr.json';
import gu from '../locales/gu.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import pa from '../locales/pa.json';
import or from '../locales/or.json';
import ur from '../locales/ur.json';
import as from '../locales/as.json';
import brx from '../locales/brx.json';
import doi from '../locales/doi.json';
import ks from '../locales/ks.json';
import kok from '../locales/kok.json';
import mai from '../locales/mai.json';
import mni from '../locales/mni.json';
import ne from '../locales/ne.json';
import sa from '../locales/sa.json';
import sat from '../locales/sat.json';
import sd from '../locales/sd.json';

const STORAGE_KEY = 'bharatscheme_lang';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  te: { translation: te },
  bn: { translation: bn },
  mr: { translation: mr },
  gu: { translation: gu },
  kn: { translation: kn },
  ml: { translation: ml },
  pa: { translation: pa },
  or: { translation: or },
  ur: { translation: ur },
  as: { translation: as },
  brx: { translation: brx },
  doi: { translation: doi },
  ks: { translation: ks },
  kok: { translation: kok },
  mai: { translation: mai },
  mni: { translation: mni },
  ne: { translation: ne },
  sa: { translation: sa },
  sat: { translation: sat },
  sd: { translation: sd },
};

function getInitialLanguage(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
  } catch {
    // Ignore localStorage access issues
  }
  return 'en';
}

export function applyDocumentLanguage(code: string): void {
  const meta = getLanguageMeta(code);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.dir;
  }
  try {
    localStorage.setItem(STORAGE_KEY, meta.code);
  } catch {
    // Ignore localStorage access issues
  }
}

const initialLng = getInitialLanguage();
applyDocumentLanguage(initialLng);

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  applyDocumentLanguage(lng);
});

export default i18n;
