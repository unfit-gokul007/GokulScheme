import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLanguageMeta } from '../i18n/languages';

export function TranslationNotice() {
  const { i18n, t } = useTranslation();
  const meta = getLanguageMeta(i18n.language);

  if (meta.code === 'en') {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-950 sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden="true" />
        <span className="font-semibold">{t('common.unverifiedTranslation')}</span>
        <span aria-hidden="true">·</span>
        <span>
          {meta.status === 'fallback'
            ? t('common.fallbackNotice')
            : `${meta.nativeName} (${meta.englishName}) — ${t('common.footerDisclaimer')}`}
        </span>
      </div>
    </div>
  );
}
