import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#0B1F3A] sm:text-3xl">
          {t('about.title')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
          {t('about.subtitle')}
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
          {t('about.whatItIsTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
          {t('about.whatItIsBody')}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
          {t('about.privacyTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
          {t('about.privacyBody')}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
          {t('about.disclaimerTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
          {t('about.disclaimerBody')}
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/discover"
          className="inline-flex min-h-[44px] items-center rounded-xl bg-[#FF9933] px-5 py-2.5 text-sm font-bold text-[#0B1F3A] hover:bg-[#ffaa4d]"
        >
          {t('hero.cta')}
        </Link>
        <Link
          to="/schemes"
          className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B1F3A] hover:bg-slate-50"
        >
          {t('hero.secondaryCta')}
        </Link>
      </div>
    </div>
  );
}
