import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Scheme, SchemeMatch } from '../lib/types';

interface SchemeCardProps {
  scheme: Scheme;
  match?: Pick<SchemeMatch, 'confidence' | 'matchedReasons' | 'unconfirmed'>;
}

export function SchemeCard({ scheme, match }: SchemeCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const confidenceMeta = match
    ? match.confidence === 'Likely'
      ? {
          label: t('results.confidenceLikely'),
          Icon: CheckCircle2,
          colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        }
      : match.confidence === 'Possible'
      ? {
          label: t('results.confidencePossible'),
          Icon: HelpCircle,
          colorClass: 'text-amber-900 bg-amber-50 border-amber-200',
        }
      : {
          label: t('results.confidenceCheck'),
          Icon: HelpCircle,
          colorClass: 'text-slate-800 bg-slate-100 border-slate-200',
        }
    : null;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm sm:p-6">
      {/* Unboxed inline metadata line (no static pill sandwich) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-[#0B1F3A]">
            {scheme.level === 'central'
              ? t('common.central')
              : `${t('common.state')}: ${scheme.state}`}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t(`categories.${scheme.category}`, { defaultValue: scheme.category })}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {t('common.lastVerified')}: {scheme.last_verified}
          </span>
        </div>

        {/* Explicit data verification or DEMO warning */}
        {scheme.data_status === 'demo' ? (
          <div className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-800">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{t('common.demoBadge')}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{t('common.verifiedOfficial')}</span>
          </div>
        )}
      </div>

      {/* Scheme Title (always original official name, never translated) */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-bold leading-snug text-[#0B1F3A] sm:text-xl">
            {scheme.name_original}
          </h3>
          {scheme.name_en !== scheme.name_original && (
            <p className="mt-0.5 text-sm font-medium text-slate-600">
              {scheme.name_en}
            </p>
          )}
        </div>

        {confidenceMeta && (
          <div
            className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border px-3 py-1.5 text-xs font-semibold ${confidenceMeta.colorClass}`}
          >
            <confidenceMeta.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{confidenceMeta.label}</span>
          </div>
        )}
      </div>

      {/* Plain Summary */}
      <p className="mt-2.5 text-sm leading-relaxed text-slate-700 sm:text-base">
        {scheme.summary}
      </p>

      {/* Match Explanation & Unconfirmed items */}
      {match && (
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-bold tracking-wide text-emerald-900">
              {t('results.whyMatched')}
            </h4>
            <ul className="mt-1.5 space-y-1 text-sm text-slate-700">
              {match.matchedReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {match.unconfirmed.length > 0 && (
            <div>
              <h4 className="text-xs font-bold tracking-wide text-amber-900">
                {t('results.couldNotConfirm')}
              </h4>
              <ul className="mt-1.5 space-y-1 text-sm text-slate-700">
                {match.unconfirmed.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <HelpCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Official Source Links + Expand Button */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-xs font-semibold text-slate-500">
            {t('common.officialSources')}:
          </span>
          {scheme.source_links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1 font-medium text-[#0E4D58] underline decoration-[#0E4D58]/40 underline-offset-4 hover:text-[#0B1F3A]"
            >
              <span>{link.label}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#0B1F3A] transition-colors hover:bg-slate-50"
        >
          <span>{expanded ? t('schemes.hideDetails') : t('schemes.showDetails')}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="mt-4 space-y-5 border-t border-slate-200 pt-5 text-sm text-slate-800">
          <div>
            <h4 className="font-display text-sm font-bold text-[#0B1F3A]">
              {t('schemes.eligibilityLabel')}
            </h4>
            <p className="mt-1.5 leading-relaxed text-slate-700">
              {scheme.eligibility.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <h4 className="font-display text-sm font-bold text-[#0B1F3A]">
                {t('schemes.benefitsLabel')}
              </h4>
              <ul className="mt-1.5 list-disc space-y-1.5 ps-5 text-slate-700">
                {scheme.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-bold text-[#0B1F3A]">
                {t('schemes.documentsLabel')}
              </h4>
              <ul className="mt-1.5 list-disc space-y-1.5 ps-5 text-slate-700">
                {scheme.documents.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-[#0B1F3A]">
              {t('schemes.stepsLabel')}
            </h4>
            <ol className="mt-1.5 list-decimal space-y-1.5 ps-5 text-slate-700">
              {scheme.application_steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </article>
  );
}
