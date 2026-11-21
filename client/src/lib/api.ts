import type { ChatMessage, ChatSource, Scheme, SchemeMatch, UserProfile } from './types';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'API_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new ApiError('Server returned an unexpected response.', res.status);
  }

  if (!res.ok) {
    const errObj = (payload as { error?: { message?: string; code?: string } })?.error;
    throw new ApiError(
      errObj?.message || 'Request failed. Please try again.',
      res.status,
      errObj?.code || 'API_ERROR'
    );
  }

  return payload as T;
}

export async function fetchHealth(): Promise<{ ok: boolean; aiEnabled: boolean }> {
  const res = await fetch('/api/health');
  return parseJsonResponse<{ ok: boolean; aiEnabled: boolean }>(res);
}

export async function fetchSchemes(filters?: {
  level?: string;
  category?: string;
  state?: string;
  q?: string;
}): Promise<{ schemes: Scheme[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.level && filters.level !== 'all') params.set('level', filters.level);
  if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters?.state && filters.state !== 'all') params.set('state', filters.state);
  if (filters?.q?.trim()) params.set('q', filters.q.trim());

  const query = params.toString();
  const res = await fetch(`/api/schemes${query ? `?${query}` : ''}`);
  return parseJsonResponse<{ schemes: Scheme[]; total: number }>(res);
}

export async function matchProfile(
  profile: UserProfile
): Promise<{ matches: SchemeMatch[]; total: number }> {
  const res = await fetch('/api/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state: profile.state || null,
      age: profile.age ? Number(profile.age) : null,
      gender: profile.gender || null,
      casteCategory: profile.casteCategory || null,
      incomeRange: profile.incomeRange || null,
      occupation: profile.occupation || null,
      toggles: profile.toggles,
    }),
  });
  return parseJsonResponse<{ matches: SchemeMatch[]; total: number }>(res);
}

export async function sendChatMessage(params: {
  message: string;
  language: string;
  languageName: string;
  history: ChatMessage[];
  shareHints: boolean;
  hints: {
    state: string | null;
    category: string | null;
    occupation: string | null;
  } | null;
}): Promise<{ answer: string; sources: ChatSource[] }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: params.message,
      language: params.language,
      languageName: params.languageName,
      history: params.history
        .filter((m) => !m.isError)
        .slice(-6)
        .map((m) => ({ role: m.role, text: m.text })),
      shareHints: params.shareHints,
      hints: params.shareHints ? params.hints : null,
    }),
  });
  return parseJsonResponse<{ answer: string; sources: ChatSource[] }>(res);
}
