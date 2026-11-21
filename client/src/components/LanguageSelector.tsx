import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/languages';

export function LanguageSelector({ fullWidth = false }: { fullWidth?: boolean }) {
  const { i18n, t } = useTranslation();

  return (
    <div className={`relative inline-flex items-center ${fullWidth ? 'w-full' : ''}`}>
      <Globe
        className="pointer-events-none absolute start-3 h-4 w-4 text-slate-600"
        aria-hidden="true"
      />
      <label htmlFor={fullWidth ? 'lang-select-mobile' : 'lang-select-desktop'} className="sr-only">
        {t('nav.language')}
      </label>
      <select
        id={fullWidth ? 'lang-select-mobile' : 'lang-select-desktop'}
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        aria-label={t('nav.language')}
        className={`min-h-[44px] appearance-none rounded-lg border border-slate-300 bg-white ps-9 pe-8 py-2 text-sm font-medium text-slate-800 transition-colors hover:border-slate-400 focus:border-[#0B1F3A] ${
          fullWidth ? 'w-full' : 'max-w-[175px]'
        }`}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.englishName})
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute end-2.5 text-xs text-slate-500"
        aria-hidden="true"
      >
        ▾
      </span>
    </div>
  );
}
