import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../context/AppStateContext';
import { INDIAN_STATES_AND_UTS } from '../lib/constants';
import type { ProfileToggles } from '../lib/types';

export function DiscoverPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, setProfile, clearProfile } = useAppState();

  const toggleItems: { key: keyof ProfileToggles; label: string }[] = [
    { key: 'student', label: t('discover.toggleStudent') },
    { key: 'farmer', label: t('discover.toggleFarmer') },
    { key: 'disability', label: t('discover.toggleDisability') },
    { key: 'bpl', label: t('discover.toggleBpl') },
    { key: 'minority', label: t('discover.toggleMinority') },
    { key: 'widow', label: t('discover.toggleWidow') },
    { key: 'senior_citizen', label: t('discover.toggleSenior') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/results');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-extrabold text-[#0B1F3A] sm:text-3xl">
        {t('discover.title')}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
        {t('discover.subtitle')}
      </p>

      {/* Visible Safety Notice */}
      <div
        role="note"
        className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
      >
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <p className="font-medium leading-relaxed">{t('discover.safetyNotice')}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-8"
      >
        {/* State / UT */}
        <div>
          <label
            htmlFor="profile-state"
            className="mb-1.5 block text-sm font-semibold text-[#0B1F3A]"
          >
            {t('discover.stateLabel')}
          </label>
          <select
            id="profile-state"
            value={profile.state}
            onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
            className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#0B1F3A]"
          >
            <option value="">{t('common.skip')}</option>
            {INDIAN_STATES_AND_UTS.map((stateName) => (
              <option key={stateName} value={stateName}>
                {stateName}
              </option>
            ))}
          </select>
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="profile-age"
                className="text-sm font-semibold text-[#0B1F3A]"
              >
                {t('discover.ageLabel')}
              </label>
              {profile.age && (
                <button
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, age: '' }))}
                  className="text-xs font-medium text-slate-500 underline hover:text-slate-800"
                >
                  {t('common.skip')}
                </button>
              )}
            </div>
            <input
              id="profile-age"
              type="number"
              min={0}
              max={120}
              inputMode="numeric"
              value={profile.age}
              onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))}
              placeholder={t('discover.agePlaceholder')}
              className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B1F3A]"
            />
          </div>

          <div>
            <label
              htmlFor="profile-gender"
              className="mb-1.5 block text-sm font-semibold text-[#0B1F3A]"
            >
              {t('discover.genderLabel')}
            </label>
            <select
              id="profile-gender"
              value={profile.gender}
              onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
              className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#0B1F3A]"
            >
              <option value="">{t('common.skip')}</option>
              <option value="female">{t('discover.genderFemale')}</option>
              <option value="male">{t('discover.genderMale')}</option>
              <option value="other">{t('discover.genderOther')}</option>
              <option value="prefer_not_to_say">{t('common.preferNotToSay')}</option>
            </select>
          </div>
        </div>

        {/* Caste / Category & Family Income */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profile-caste"
              className="mb-1.5 block text-sm font-semibold text-[#0B1F3A]"
            >
              {t('discover.casteLabel')}
            </label>
            <select
              id="profile-caste"
              value={profile.casteCategory}
              onChange={(e) => setProfile((p) => ({ ...p, casteCategory: e.target.value }))}
              className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#0B1F3A]"
            >
              <option value="">{t('common.skip')}</option>
              <option value="General">{t('discover.casteGeneral')}</option>
              <option value="OBC">{t('discover.casteOBC')}</option>
              <option value="SC">{t('discover.casteSC')}</option>
              <option value="ST">{t('discover.casteST')}</option>
              <option value="prefer_not_to_say">{t('common.preferNotToSay')}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="profile-income"
              className="mb-1.5 block text-sm font-semibold text-[#0B1F3A]"
            >
              {t('discover.incomeLabel')}
            </label>
            <select
              id="profile-income"
              value={profile.incomeRange}
              onChange={(e) => setProfile((p) => ({ ...p, incomeRange: e.target.value }))}
              className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#0B1F3A]"
            >
              <option value="">{t('common.skip')}</option>
              <option value="under_1l">{t('discover.incomeUnder1L')}</option>
              <option value="1l_2.5l">{t('discover.income1to25L')}</option>
              <option value="2.5l_5l">{t('discover.income25to5L')}</option>
              <option value="5l_8l">{t('discover.income5to8L')}</option>
              <option value="above_8l">{t('discover.incomeAbove8L')}</option>
            </select>
          </div>
        </div>

        {/* Occupation */}
        <div>
          <label
            htmlFor="profile-occupation"
            className="mb-1.5 block text-sm font-semibold text-[#0B1F3A]"
          >
            {t('discover.occupationLabel')}
          </label>
          <select
            id="profile-occupation"
            value={profile.occupation}
            onChange={(e) => setProfile((p) => ({ ...p, occupation: e.target.value }))}
            className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#0B1F3A]"
          >
            <option value="">{t('common.skip')}</option>
            <option value="farmer">{t('discover.occFarmer')}</option>
            <option value="student">{t('discover.occStudent')}</option>
            <option value="artisan">{t('discover.occArtisan')}</option>
            <option value="street_vendor">{t('discover.occVendor')}</option>
            <option value="rural_worker">{t('discover.occRuralWorker')}</option>
            <option value="micro_business">{t('discover.occMicroBiz')}</option>
            <option value="salaried">{t('discover.occSalaried')}</option>
            <option value="homemaker">{t('discover.occHomemaker')}</option>
            <option value="unemployed">{t('discover.occUnemployed')}</option>
            <option value="other">{t('discover.occOther')}</option>
          </select>
        </div>

        {/* Household Toggles */}
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-[#0B1F3A]">
            {t('discover.togglesLabel')}
          </legend>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {toggleItems.map((item) => {
              const checked = profile.toggles[item.key];
              return (
                <label
                  key={item.key}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    checked
                      ? 'border-[#0E4D58] bg-[#0E4D58]/5 text-[#0B1F3A]'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        toggles: { ...p.toggles, [item.key]: e.target.checked },
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-[#0E4D58]"
                  />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={clearProfile}
            className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {t('discover.clear')}
          </button>

          <button
            type="submit"
            className="min-h-[48px] rounded-xl bg-[#FF9933] px-7 py-3 text-base font-bold text-[#0B1F3A] shadow-xs transition-colors hover:bg-[#ffaa4d]"
          >
            {t('discover.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
