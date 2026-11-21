import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, '../data/schemes.json');

let cachedSchemes = null;

function loadSchemes() {
  if (!cachedSchemes) {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    cachedSchemes = JSON.parse(raw);
  }
  return cachedSchemes;
}

export function getAllSchemes(filters = {}) {
  const schemes = loadSchemes();
  const { level, category, state, q } = filters;

  return schemes.filter((scheme) => {
    if (level && level !== 'all' && scheme.level !== level) {
      return false;
    }

    if (category && category !== 'all' && scheme.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    if (state && state !== 'all') {
      const normalizedState = state.trim().toLowerCase();
      if (scheme.level === 'state') {
        if (!scheme.state || scheme.state.toLowerCase() !== normalizedState) {
          return false;
        }
      }
      // Central schemes apply across all states, unless user specifically filters for state-only via level=state
    }

    if (q && q.trim().length > 0) {
      const query = q.trim().toLowerCase();
      const haystack = [
        scheme.name_en,
        scheme.name_original,
        scheme.category,
        scheme.state || 'central india',
        scheme.summary,
        scheme.eligibility?.description || '',
        ...(scheme.benefits || []),
        ...(scheme.documents || []),
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export function getSchemeById(id) {
  const schemes = loadSchemes();
  return schemes.find((s) => s.id === id) || null;
}

export function getAvailableStates() {
  const schemes = loadSchemes();
  const states = new Set();
  for (const s of schemes) {
    if (s.state) states.add(s.state);
  }
  return Array.from(states).sort();
}
