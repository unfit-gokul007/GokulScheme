import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <p className="font-display text-4xl font-extrabold text-[#0B1F3A] tabular-nums">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-[#0B1F3A]">
        {t('notFound.title')}
      </h1>
      <p className="mt-2 text-sm text-slate-600">{t('notFound.body')}</p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-[#FF9933] px-6 py-2.5 text-sm font-bold text-[#0B1F3A] hover:bg-[#ffaa4d]"
      >
        {t('notFound.backHome')}
      </Link>
    </div>
  );
}
