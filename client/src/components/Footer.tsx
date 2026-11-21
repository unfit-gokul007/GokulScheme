import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="bg-[#0B1F3A] px-4 py-3 text-center text-xs leading-relaxed text-slate-100 sm:px-6 sm:text-sm">
        <p className="mx-auto max-w-5xl">{t('common.footerDisclaimer')}</p>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:px-6">
        <div className="font-display font-semibold text-[#0B1F3A]">
          IN {t('common.brand')}
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/" className="min-h-[44px] inline-flex items-center hover:text-[#0B1F3A] hover:underline">
            {t('nav.home')}
          </Link>
          <Link to="/discover" className="min-h-[44px] inline-flex items-center hover:text-[#0B1F3A] hover:underline">
            {t('nav.discover')}
          </Link>
          <Link to="/schemes" className="min-h-[44px] inline-flex items-center hover:text-[#0B1F3A] hover:underline">
            {t('nav.schemes')}
          </Link>
          <Link to="/assistant" className="min-h-[44px] inline-flex items-center hover:text-[#0B1F3A] hover:underline">
            {t('nav.assistant')}
          </Link>
          <Link to="/about" className="min-h-[44px] inline-flex items-center hover:text-[#0B1F3A] hover:underline">
            {t('nav.about')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
