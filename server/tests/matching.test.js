import { describe, it, expect } from 'vitest';
import { matchSchemes } from '../services/matching.js';
import { getAllSchemes } from '../repo/schemeRepo.js';

describe('Scheme matching scorer', () => {
  const schemes = getAllSchemes();

  it('never excludes central schemes when all fields are skipped/empty', () => {
    const matches = matchSchemes({}, schemes);
    expect(matches.length).toBeGreaterThanOrEqual(15);
    expect(matches.every((m) => m.confidence === 'Check eligibility')).toBe(true);
    expect(matches.every((m) => m.unconfirmed.length > 0)).toBe(true);
  });

  it('ranks PM-KISAN and PMFBY high for a farmer profile', () => {
    const matches = matchSchemes(
      {
        state: 'Uttar Pradesh',
        age: 42,
        occupation: 'farmer',
        incomeRange: 'under_1l',
        toggles: { farmer: true, bpl: true },
      },
      schemes
    );

    const topIds = matches.slice(0, 5).map((m) => m.scheme.id);
    expect(topIds).toContain('pm-kisan');
    expect(topIds).toContain('pmfby');

    const pmKisan = matches.find((m) => m.scheme.id === 'pm-kisan');
    expect(pmKisan?.confidence).toBe('Likely');
    expect(pmKisan?.matchedReasons.length).toBeGreaterThan(0);
  });

  it('filters out other-state schemes when user selects a specific state', () => {
    const matches = matchSchemes(
      {
        state: 'Maharashtra',
        gender: 'female',
        age: 30,
        incomeRange: '1l_2.5l',
      },
      schemes
    );

    const ids = matches.map((m) => m.scheme.id);
    expect(ids).toContain('ladki-bahin-mh');
    expect(ids).toContain('mjpjay-maharashtra');
    expect(ids).not.toContain('lakshmir-bhandar-wb');
    expect(ids).not.toContain('gruha-lakshmi-ka');
    expect(ids).not.toContain('kalaignar-magalir-urimai-tn');
  });

  it('filters out women-only schemes when user explicitly selects male', () => {
    const matches = matchSchemes(
      {
        state: 'Maharashtra',
        gender: 'male',
        age: 35,
      },
      schemes
    );

    const ids = matches.map((m) => m.scheme.id);
    expect(ids).not.toContain('ladki-bahin-mh');
    expect(ids).not.toContain('pmmvy');
    expect(ids).not.toContain('ignwps');
  });

  it('matches SC/ST post-matric scholarship for eligible student and excludes General', () => {
    const scStudentMatches = matchSchemes(
      {
        age: 19,
        casteCategory: 'SC',
        incomeRange: '1l_2.5l',
        occupation: 'student',
        toggles: { student: true },
      },
      schemes
    );
    expect(scStudentMatches.some((m) => m.scheme.id === 'nsp-post-matric-sc-st')).toBe(true);

    const generalStudentMatches = matchSchemes(
      {
        age: 19,
        casteCategory: 'General',
        incomeRange: '1l_2.5l',
        occupation: 'student',
        toggles: { student: true },
      },
      schemes
    );
    expect(generalStudentMatches.some((m) => m.scheme.id === 'nsp-post-matric-sc-st')).toBe(false);
  });

  it('grants senior citizen (70+) universal coverage match for PM-JAY regardless of income', () => {
    const matches = matchSchemes(
      {
        age: 74,
        incomeRange: 'above_8l',
        toggles: { senior_citizen: true },
      },
      schemes
    );
    const pmjay = matches.find((m) => m.scheme.id === 'ayushman-bharat-pmjay');
    expect(pmjay).toBeDefined();
    expect(pmjay?.matchedReasons.some((r) => r.includes('70+'))).toBe(true);
  });

  it('matches youth & graduate employment schemes for unemployed job seekers', () => {
    const matches = matchSchemes(
      {
        age: 23,
        incomeRange: '1l_2.5l',
        occupation: 'unemployed',
      },
      schemes
    );
    const ids = matches.map((m) => m.scheme.id);
    expect(ids).toContain('pm-internship-scheme');
    expect(ids).toContain('pmkvy-4');
    expect(ids).toContain('pmegp');
    expect(ids).toContain('national-career-service');
  });
});
