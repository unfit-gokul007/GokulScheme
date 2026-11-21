const INCOME_BRACKETS = {
  under_1l: { min: 0, max: 100000, label: 'Under ₹1 lakh' },
  '1l_2.5l': { min: 100001, max: 250000, label: '₹1 lakh – ₹2.5 lakh' },
  '2.5l_5l': { min: 250001, max: 500000, label: '₹2.5 lakh – ₹5 lakh' },
  '5l_8l': { min: 500001, max: 800000, label: '₹5 lakh – ₹8 lakh' },
  above_8l: { min: 800001, max: Infinity, label: 'Above ₹8 lakh' },
};

const OCCUPATION_LABELS = {
  farmer: 'Farmer / Cultivator',
  student: 'Student',
  artisan: 'Traditional Artisan / Craftsperson',
  street_vendor: 'Street Vendor / Hawker',
  rural_worker: 'Rural Wage Worker',
  micro_business: 'Small / Micro Business Owner',
  salaried: 'Salaried Employee',
  homemaker: 'Homemaker',
  unemployed: 'Job Seeker / Unemployed',
  other: 'Other',
};

const TOGGLE_LABELS = {
  student: 'Student',
  farmer: 'Farmer',
  disability: 'Person with disability',
  bpl: 'BPL household',
  minority: 'Minority community',
  widow: 'Widow / single woman',
  senior_citizen: 'Senior citizen',
};

function normalizeProfile(raw = {}) {
  const state = typeof raw.state === 'string' && raw.state.trim() && raw.state !== 'skip' ? raw.state.trim() : null;
  const age =
    raw.age !== undefined && raw.age !== null && raw.age !== '' && !Number.isNaN(Number(raw.age))
      ? Number(raw.age)
      : null;
  const gender =
    typeof raw.gender === 'string' && raw.gender.trim() && !['skip', 'prefer_not_to_say'].includes(raw.gender)
      ? raw.gender.trim().toLowerCase()
      : null;
  const casteCategory =
    typeof raw.casteCategory === 'string' &&
    raw.casteCategory.trim() &&
    !['skip', 'prefer_not_to_say'].includes(raw.casteCategory)
      ? raw.casteCategory.trim()
      : null;
  const incomeRange =
    typeof raw.incomeRange === 'string' && INCOME_BRACKETS[raw.incomeRange] ? raw.incomeRange : null;
  const occupation =
    typeof raw.occupation === 'string' && raw.occupation.trim() && raw.occupation !== 'skip'
      ? raw.occupation.trim().toLowerCase()
      : null;

  const toggles = { ...(raw.toggles || {}) };
  if (occupation === 'student') toggles.student = true;
  if (occupation === 'farmer') toggles.farmer = true;
  if (age !== null && age >= 60) toggles.senior_citizen = true;

  return { state, age, gender, casteCategory, incomeRange, occupation, toggles };
}

function hasAnyProfileInput(profile) {
  return Boolean(
    profile.state ||
      profile.age !== null ||
      profile.gender ||
      profile.casteCategory ||
      profile.incomeRange ||
      profile.occupation ||
      Object.values(profile.toggles).some(Boolean)
  );
}

/**
 * Transparent rule-based scorer.
 * Missing answers NEVER exclude a scheme; they only lower confidence and populate `unconfirmed`.
 */
export function matchSchemes(rawProfile, schemes) {
  const profile = normalizeProfile(rawProfile);
  const userProvidedAnything = hasAnyProfileInput(profile);
  const results = [];

  for (const scheme of schemes) {
    const rules = scheme.eligibility?.rules || {};
    let score = 40; // Base score for a valid public scheme
    const matchedReasons = [];
    const unconfirmed = [...(rules.unconfirmedNotes || [])];
    let excluded = false;

    // 1. Geographic (State / Level)
    const schemeStates = rules.states || ['ALL'];
    if (schemeStates.includes('ALL')) {
      score += 10;
      matchedReasons.push('Available across all States & Union Territories (Central scheme)');
    } else if (profile.state) {
      const stateMatch = schemeStates.some((s) => s.toLowerCase() === profile.state.toLowerCase());
      if (stateMatch) {
        score += 24;
        matchedReasons.push(`Available in your selected state (${profile.state})`);
      } else {
        excluded = true;
      }
    } else {
      unconfirmed.unshift(`Residence in ${schemeStates.join(', ')} (state not provided)`);
    }

    if (excluded) continue;

    // 2. Gender check
    const allowedGenders = rules.gender || ['all'];
    if (!allowedGenders.includes('all')) {
      if (profile.gender) {
        if (allowedGenders.includes(profile.gender)) {
          score += 15;
          matchedReasons.push(`Matches gender eligibility (${profile.gender})`);
        } else {
          excluded = true;
        }
      } else {
        unconfirmed.push(`Eligibility requires ${allowedGenders.join('/')} applicant`);
      }
    }

    if (excluded) continue;

    // 3. Age check
    const isSeniorUniversal =
      typeof rules.seniorUniversalAge === 'number' &&
      profile.age !== null &&
      profile.age >= rules.seniorUniversalAge;

    if (rules.minAge !== null || rules.maxAge !== null) {
      if (profile.age !== null) {
        const minOk = rules.minAge === null || profile.age >= rules.minAge;
        const maxOk = rules.maxAge === null || profile.age <= rules.maxAge;
        if (minOk && maxOk) {
          score += 12;
          matchedReasons.push(`Your age (${profile.age}) is within the scheme age range`);
        } else {
          excluded = true;
        }
      } else {
        const rangeText =
          rules.minAge && rules.maxAge
            ? `${rules.minAge}–${rules.maxAge} years`
            : rules.minAge
            ? `${rules.minAge}+ years`
            : `up to ${rules.maxAge} years`;
        unconfirmed.push(`Age requirement (${rangeText}) not confirmed`);
      }
    }

    if (excluded) continue;

    // 4. Caste / Social category
    const allowedCastes = rules.casteCategories || ['all'];
    if (!allowedCastes.includes('all')) {
      if (profile.casteCategory) {
        const casteMatch = allowedCastes.some(
          (c) => c.toLowerCase() === profile.casteCategory.toLowerCase()
        );
        if (casteMatch) {
          score += 18;
          matchedReasons.push(`Matches category eligibility (${profile.casteCategory})`);
        } else {
          excluded = true;
        }
      } else {
        unconfirmed.push(`Requires ${allowedCastes.join('/')} category certificate`);
      }
    }

    if (excluded) continue;

    // 5. Income range check
    if (rules.maxIncome !== null && rules.maxIncome !== undefined) {
      if (isSeniorUniversal) {
        score += 20;
        matchedReasons.push('Senior citizen (70+) universal coverage applies regardless of income');
      } else if (profile.incomeRange) {
        const bracket = INCOME_BRACKETS[profile.incomeRange];
        if (bracket.min > rules.maxIncome) {
          excluded = true;
        } else if (bracket.max <= rules.maxIncome) {
          score += 16;
          matchedReasons.push(`Income range (${bracket.label}) fits within the ₹${rules.maxIncome.toLocaleString('en-IN')} limit`);
        } else {
          // Bracket partially overlaps cap
          score += 6;
          unconfirmed.push(`Exact annual income must be ≤ ₹${rules.maxIncome.toLocaleString('en-IN')}`);
        }
      } else {
        unconfirmed.push(`Annual family income limit (≤ ₹${rules.maxIncome.toLocaleString('en-IN')}) not confirmed`);
      }
    } else if (profile.incomeRange) {
      score += 4;
    }

    if (excluded) continue;

    // 6. Required toggles (e.g., farmer, student, disability, widow)
    const requiredToggles = rules.requiredToggles || [];
    for (const toggleKey of requiredToggles) {
      if (profile.toggles[toggleKey]) {
        score += 22;
        matchedReasons.push(`Matches your profile (${TOGGLE_LABELS[toggleKey] || toggleKey})`);
      } else if (!userProvidedAnything) {
        unconfirmed.push(`${TOGGLE_LABELS[toggleKey] || toggleKey} status not provided`);
      } else if (
        // Only exclude on explicit contradiction when user answered occupation/toggles and it clearly doesn't match
        (toggleKey === 'student' && profile.occupation && profile.occupation !== 'student') ||
        (toggleKey === 'farmer' && profile.occupation && !['farmer', 'rural_worker'].includes(profile.occupation))
      ) {
        excluded = true;
      } else {
        score -= 12;
        unconfirmed.push(`Requires ${TOGGLE_LABELS[toggleKey] || toggleKey} status`);
      }
    }

    if (excluded) continue;

    // 7. Occupation alignment
    const allowedOccupations = rules.occupations || ['all'];
    if (!allowedOccupations.includes('all')) {
      if (profile.occupation) {
        if (allowedOccupations.includes(profile.occupation)) {
          score += 16;
          matchedReasons.push(`Relevant to your occupation (${OCCUPATION_LABELS[profile.occupation] || profile.occupation})`);
        } else if (!requiredToggles.some((t) => profile.toggles[t])) {
          score -= 8;
          unconfirmed.push(`Typically targets ${allowedOccupations.map((o) => OCCUPATION_LABELS[o] || o).join(', ')}`);
        }
      } else {
        unconfirmed.push(`Occupation / livelihood activity not specified`);
      }
    }

    // 8. Preferred toggles (BPL, senior citizen, disability, etc.)
    const preferredToggles = rules.preferredToggles || [];
    for (const pref of preferredToggles) {
      if (profile.toggles[pref]) {
        score += 12;
        matchedReasons.push(`Priority group match (${TOGGLE_LABELS[pref] || pref})`);
      }
    }

    // Clamp score 0..100
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    // Confidence level
    let confidence = 'Check eligibility';
    if (!userProvidedAnything) {
      confidence = 'Check eligibility';
    } else if (finalScore >= 72 && unconfirmed.length <= 2) {
      confidence = 'Likely';
    } else if (finalScore >= 52) {
      confidence = 'Possible';
    } else {
      confidence = 'Check eligibility';
    }

    if (matchedReasons.length === 0) {
      matchedReasons.push('General public welfare scheme matching available criteria');
    }

    // Deduplicate reasons & unconfirmed
    results.push({
      scheme,
      score: finalScore,
      confidence,
      matchedReasons: Array.from(new Set(matchedReasons)),
      unconfirmed: Array.from(new Set(unconfirmed)),
    });
  }

  // Sort by score descending, then verified before demo, then name
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.scheme.data_status !== b.scheme.data_status) {
      return a.scheme.data_status === 'verified' ? -1 : 1;
    }
    return a.scheme.name_en.localeCompare(b.scheme.name_en);
  });

  return results;
}
