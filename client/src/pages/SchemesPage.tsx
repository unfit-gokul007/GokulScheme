import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchSchemes } from '../lib/api';
import type { Scheme } from '../lib/types';
import { SchemeCard } from '../components/SchemeCard';
import { SchemeFilters, type FilterState } from '../components/SchemeFilters';
import { SchemeSkeleton } from '../components/SchemeSkeleton';

const DEFAULT_FILTERS: FilterState = {
  level: 'all',
  category: 'all',
  state: 'all',
  q: '',
};

export function SchemesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(() => ({
    level: (searchParams.get('level') as FilterState['level']) || 'all',
    category: searchParams.get('category') || 'all',
    state: searchParams.get('state') || 'all',
    q: searchParams.get('q') || '',
  }));

  const loadSchemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSchemes(filters);
      setSchemes(data.schemes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch schemes.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSchemes();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadSchemes]);

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
    const params = new URLSearchParams();
    if (next.level !== 'all') params.set('level', next.level);
    if (next.category !== 'all') params.set('category', next.category);
    if (next.state !== 'all') params.set('state', next.state);
    if (next.q.trim()) params.set('q', next.q.trim());
    setSearchParams(params, { replace: true });
  };

  const handleReset = () => {
    handleFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#0B1F3A] sm:text-3xl">
          {t('schemes.title')}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
          {t('schemes.subtitle')}
        </p>
      </div>

      <SchemeFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />

      {loading ? (
        <SchemeSkeleton count={4} />
      ) : error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <AlertCircle className="mx-auto h-8 w-8 text-red-700" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-red-900">{error}</p>
          <button
            type="button"
            onClick={loadSchemes}
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-red-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>{t('common.retry')}</span>
          </button>
        </div>
      ) : schemes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
            {t('results.emptyTitle')}
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">{t('results.emptyBody')}</p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#103252]"
          >
            {t('results.resetFilters')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-600 tabular-nums">
            {schemes.length} {schemes.length === 1 ? 'scheme' : 'schemes'}
          </p>
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  );
}
