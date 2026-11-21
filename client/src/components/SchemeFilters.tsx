import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { INDIAN_STATES_AND_UTS, SCHEME_CATEGORIES } from '../lib/constants';

export interface FilterState {
  level: 'all' | 'central' | 'state';
  category: string;
  state: string;
  q: string;
}

interface SchemeFiltersProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

export function SchemeFilters({ filters, onChange, onReset }: SchemeFiltersProps) {
  const { t } = useTranslation();

  const hasActiveFilters =
    filters.level !== 'all' ||
    filters.category !== 'all' ||
    filters.state !== 'all' ||
    filters.q.trim() !== '';

  return (
    <section
      aria-label="Filter schemes"
      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
        {/* Search Input */}
        <div className="md:col-span-4">
          <label
            htmlFor="scheme-search"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            {t('schemes.searchPlaceholder')}
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="scheme-search"
              type="search"
              value={filters.q}
              onChange={(e) => onChange({ ...filters, q: e.target.value })}
              placeholder={t('schemes.searchPlaceholder')}
              className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white ps-9 pe-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B1F3A]"
            />
          </div>
        </div>

        {/* Level Segmented Control */}
        <div className="md:col-span-3">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            {t('schemes.filterLevel')}
          </span>
          <div
            role="group"
            aria-label={t('schemes.filterLevel')}
            className="grid grid-cols-3 rounded-xl bg-slate-100 p-1"
          >
            {(['all', 'central', 'state'] as const).map((lvl) => {
              const active = filters.level === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onChange({ ...filters, level: lvl })}
                  aria-pressed={active}
                  className={`min-h-[38px] rounded-lg px-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#0B1F3A] text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {t(`common.${lvl}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Select */}
        <div className="md:col-span-2">
          <label
            htmlFor="filter-category"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            {t('schemes.filterCategory')}
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0B1F3A]"
          >
            <option value="all">{t('common.all')}</option>
            {SCHEME_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`categories.${cat}`)}
              </option>
            ))}
          </select>
        </div>

        {/* State Select */}
        <div className="md:col-span-3">
          <label
            htmlFor="filter-state"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            {t('schemes.filterState')}
          </label>
          <div className="flex items-center gap-2">
            <select
              id="filter-state"
              value={filters.state}
              onChange={(e) => onChange({ ...filters, state: e.target.value })}
              className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0B1F3A]"
            >
              <option value="all">{t('common.all')}</option>
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onReset}
                aria-label={t('results.resetFilters')}
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
