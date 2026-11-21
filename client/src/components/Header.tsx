import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/discover', label: t('nav.discover'), end: false },
    { to: '/schemes', label: t('nav.schemes'), end: false },
    { to: '/assistant', label: t('nav.assistant'), end: false },
    { to: '/about', label: t('nav.about'), end: false },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          onClick={closeMobile}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap font-display text-lg font-bold tracking-tight text-[#0B1F3A]"
        >
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#0B1F3A] text-xs font-extrabold tracking-wide text-[#FF9933]"
            aria-hidden="true"
          >
            IN
          </span>
          <span>{t('common.brand')}</span>
        </Link>

        {/* Zone 2: Primary Text Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 md:flex"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `inline-flex min-h-[44px] shrink-0 items-center border-b-2 px-0.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#E86A17] text-[#0B1F3A]'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Language Selector + Mobile Menu Button */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          className="border-t border-slate-200 bg-white px-4 py-3 md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#0B1F3A]/5 font-semibold text-[#0B1F3A]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 border-t border-slate-100 pt-3 sm:hidden">
            <LanguageSelector fullWidth />
          </div>
        </div>
      )}
    </header>
  );
}
