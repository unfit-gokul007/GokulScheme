import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../context/AppStateContext';
import { matchProfile } from '../lib/api';
import type { SchemeMatch } from '../lib/types';
import { SchemeCard } from '../components/SchemeCard';
import { SchemeFilters, type FilterState } from '../components/SchemeFilters';
import { SchemeSkeleton } from '../components/SchemeSkeleton';

const DEFAULT_FILTERS: FilterState = {
  level: 'all',
  category: 'all',
  state: 'all',
  q: '',
};

export function ResultsPage() {
  const { t } = useTranslation();
  const { profile } = useAppState();
  const [matches, setMatches] = useState<SchemeMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    state: profile.state || 'all',
  }));

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await matchProfile(profile);
      setMatches(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load scheme matches.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const filteredMatches = useMemo(() => {
    return matches.filter(({ scheme }) => {
      if (filters.level !== 'all' && scheme.level !== filters.level) return false;
      if (
        filters.category !== 'all' &&
        scheme.category.toLowerCase() !== filters.category.toLowerCase()
      ) {
        return false;
      }
      if (filters.state !== 'all' && scheme.level === 'state') {
        if (!scheme.state || scheme.state.toLowerCase() !== filters.state.toLowerCase()) {
          return false;
        }
      }
      if (filters.q.trim()) {
        const q = filters.q.trim().toLowerCase();
        const text = [
          scheme.name_en,
          scheme.name_original,
          scheme.category,
          scheme.state || '',
          scheme.summary,
          scheme.eligibility.description,
        ]
          .join(' ')
          .toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [matches, filters]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#0B1F3A] sm:text-3xl">
            {t('results.title')}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
            {t('results.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/discover"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#0B1F3A] hover:bg-slate-50"
          >
            {t('results.editProfile')}
          </Link>
          <Link
            to="/schemes"
            className="inline-flex min-h-[44px] items-center rounded-xl bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#103252]"
          >
            {t('results.browseAll')}
          </Link>
        </div>
      </div>

      <SchemeFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {loading ? (
        <SchemeSkeleton count={4} />
      ) : error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <AlertCircle className="mx-auto h-8 w-8 text-red-700" aria-hidden="true" />
          <h2 className="mt-3 font-display text-lg font-bold text-red-900">
            {t('results.errorTitle')}
          </h2>
          <p className="mt-1 text-sm text-red-800">{error}</p>
          <button
            type="button"
            onClick={loadMatches}
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-red-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>{t('common.retry')}</span>
          </button>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
            {t('results.emptyTitle')}
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">{t('results.emptyBody')}</p>
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#103252]"
          >
            {t('results.resetFilters')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-600 tabular-nums">
            {filteredMatches.length} {filteredMatches.length === 1 ? 'scheme' : 'schemes'}
          </p>
          {filteredMatches.map((m) => (
            <SchemeCard
              key={m.scheme.id}
              scheme={m.scheme}
              match={{
                confidence: m.confidence,
                matchedReasons: m.matchedReasons,
                unconfirmed: m.unconfirmed,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
