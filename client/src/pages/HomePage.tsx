import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  HeartPulse,
  ShieldCheck,
  Sprout,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SCHEME_CATEGORIES } from '../lib/constants';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Agriculture: Sprout,
  Education: BookOpen,
  Healthcare: HeartPulse,
  Employment: Briefcase,
  'Women & Children': Users,
  Housing: Building2,
};

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-6 sm:px-6 sm:py-10">
      {/* Hero Panel: Deep Navy to Teal Gradient */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1F3A] via-[#103252] to-[#0E4D58] px-6 py-12 text-white shadow-sm sm:px-12 sm:py-16">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#FF9933]">
            <span>IN</span>
            <span aria-hidden="true">·</span>
            <span>{t('common.brand')}</span>
          </div>

          <h1
            className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
            style={{ textWrap: 'balance', lineHeight: 1.15 }}
          >
            {t('hero.title')}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-100 sm:text-lg">
            {t('hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/discover"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#FF9933] px-6 py-3 text-base font-bold text-[#0B1F3A] shadow-sm transition-colors hover:bg-[#ffaa4d]"
            >
              <span>{t('hero.cta')}</span>
              <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </Link>

            <Link
              to="/schemes"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              {t('hero.secondaryCta')}
            </Link>
          </div>
        </div>

        {/* Subtle geometric accent (purely decorative, non-blocking) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-16 -bottom-16 h-64 w-64 rounded-full border border-white/10 bg-[#FF9933]/10 blur-2xl"
        />
      </section>

      {/* 3 Benefit Cards */}
      <section aria-labelledby="benefits-heading">
        <h2
          id="benefits-heading"
          className="font-display text-xl font-bold text-[#0B1F3A] sm:text-2xl"
        >
          {t('benefits.heading')}
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>01</span>
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-[#0B1F3A]">
              {t('benefits.card1Title')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t('benefits.card1Body')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-xs font-bold text-[#C2410C]">02</div>
            <h3 className="mt-2 font-display text-lg font-bold text-[#0B1F3A]">
              {t('benefits.card2Title')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t('benefits.card2Body')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-xs font-bold text-[#0E4D58]">03</div>
            <h3 className="mt-2 font-display text-lg font-bold text-[#0B1F3A]">
              {t('benefits.card3Title')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t('benefits.card3Body')}
            </p>
          </div>
        </div>
      </section>

      {/* Scheme Categories */}
      <section aria-labelledby="categories-heading">
        <div>
          <h2
            id="categories-heading"
            className="font-display text-xl font-bold text-[#0B1F3A] sm:text-2xl"
          >
            {t('categories.heading')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t('categories.subtitle')}</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCHEME_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category] || Briefcase;
            return (
              <Link
                key={category}
                to={`/schemes?category=${encodeURIComponent(category)}`}
                className="group flex min-h-[76px] items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-[#0E4D58] hover:shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A]/5 text-[#0B1F3A] transition-colors group-hover:bg-[#0E4D58] group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-base font-bold text-[#0B1F3A]">
                    {t(`categories.${category}`)}
                  </span>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0E4D58] rtl:rotate-180"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3-Step Strip */}
      <section
        aria-labelledby="steps-heading"
        className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        <h2
          id="steps-heading"
          className="font-display text-xl font-bold text-[#0B1F3A] sm:text-2xl"
        >
          {t('steps.heading')}
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="font-display text-sm font-bold text-[#C2410C] tabular-nums">
              01. {t('steps.step1Title')}
            </span>
            <p className="text-sm leading-relaxed text-slate-600">{t('steps.step1Body')}</p>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 md:border-s md:border-t-0 md:ps-6 md:pt-0">
            <span className="font-display text-sm font-bold text-[#0E4D58] tabular-nums">
              02. {t('steps.step2Title')}
            </span>
            <p className="text-sm leading-relaxed text-slate-600">{t('steps.step2Body')}</p>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 md:border-s md:border-t-0 md:ps-6 md:pt-0">
            <span className="font-display text-sm font-bold text-emerald-800 tabular-nums">
              03. {t('steps.step3Title')}
            </span>
            <p className="text-sm leading-relaxed text-slate-600">{t('steps.step3Body')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
