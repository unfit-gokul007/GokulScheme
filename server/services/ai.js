import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const PLACEHOLDER_KEYS = new Set(['', 'your_key_here', 'MY_GEMINI_API_KEY']);

export function isAiEnabled() {
  const key = process.env.GEMINI_API_KEY?.trim() || '';
  return Boolean(key && !PLACEHOLDER_KEYS.has(key));
}

export function retrieveRelevantSchemes(query, schemes, hints = null, limit = 5) {
  const tokens = (query || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const queryLower = (query || '').toLowerCase();
  const extraTokens = [];
  if (queryLower.includes('graduate') || queryLower.includes('degree') || queryLower.includes('job') || queryLower.includes('unemployed')) {
    extraTokens.push('unemployed', 'graduates', 'internship', 'career', 'skill', 'employment', 'scholarship');
  }
  const allTokens = Array.from(new Set([...tokens, ...extraTokens]));

  const scored = schemes.map((scheme) => {
    let score = 0;
    const text = [
      scheme.name_en,
      scheme.name_original,
      scheme.category,
      scheme.state || '',
      scheme.summary,
      scheme.eligibility?.description || '',
      ...(scheme.eligibility?.rules?.occupations || []),
      ...(scheme.benefits || []),
      ...(scheme.documents || []),
    ]
      .join(' ')
      .toLowerCase();

    for (const token of allTokens) {
      if (scheme.name_en.toLowerCase().includes(token)) score += 6;
      if (scheme.category.toLowerCase().includes(token)) score += 4;
      if (scheme.state && scheme.state.toLowerCase().includes(token)) score += 5;
      if (text.includes(token)) score += 2;
    }

    if (hints) {
      if (hints.state && scheme.state && scheme.state.toLowerCase() === hints.state.toLowerCase()) {
        score += 5;
      }
      if (hints.category && scheme.category.toLowerCase() === hints.category.toLowerCase()) {
        score += 4;
      }
      if (
        hints.occupation &&
        scheme.eligibility?.rules?.occupations?.includes(hints.occupation.toLowerCase())
      ) {
        score += 5;
      }
    }

    return { scheme, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((item) => item.scheme);
}

function buildSystemInstruction(languageName, contextSchemes) {
  const serialized = contextSchemes.map((s) => ({
    id: s.id,
    name_original: s.name_original,
    name_en: s.name_en,
    level: s.level,
    state: s.state,
    category: s.category,
    summary: s.summary,
    eligibility: s.eligibility?.description,
    benefits: s.benefits,
    documents: s.documents,
    application_steps: s.application_steps,
    source_links: s.source_links,
    last_verified: s.last_verified,
    data_status: s.data_status,
  }));

  return `You are GokulScheme AI's informational assistant helping people in India understand government welfare schemes.

STRICT GROUNDING & SAFETY RULES:
1. Answer ONLY using the provided scheme records below. Do NOT invent scheme names, amounts, deadlines, eligibility rules, or URLs.
2. Always cite the relevant official source links from the provided records (include the exact URL).
3. If the information requested is not in the provided scheme records, explicitly reply: "I don't have verified information on this; please check the official source" (translated naturally into the user's language if non-English, while keeping the meaning exact) and point to https://www.myscheme.gov.in/ if appropriate.
4. Do NOT provide legal advice or guarantee eligibility. State clearly that results are informational estimates and the government department makes the final decision.
5. NEVER ask the user for Aadhaar numbers, PAN numbers, OTPs, bank account numbers, or document uploads.
6. Respond in ${languageName}. Keep official scheme names (name_original / name_en) intact in their original form, placing any explanation or translation alongside them.
7. Keep responses concise, structured with bullet points where helpful, and easy to read on a mobile phone.

PROVIDED SCHEME RECORDS:
${JSON.stringify(serialized)}`;
}

function isTransientError(err) {
  const status = err?.status || err?.code;
  const msg = String(err?.message || '').toUpperCase();
  return (
    status === 503 ||
    status === 500 ||
    status === 502 ||
    status === 504 ||
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('OVERLOADED') ||
    msg.includes('INTERNAL')
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithTimeout(ai, model, contents, config, timeoutMs = 25000) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const timeoutErr = new Error('The AI assistant took too long to respond. Please try again.');
      timeoutErr.code = 'AI_TIMEOUT';
      timeoutErr.status = 504;
      reject(timeoutErr);
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([
      ai.models.generateContent({ model, contents, config }),
      timeoutPromise,
    ]);
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function generateGroundedAnswer({
  message,
  languageName = 'English',
  history = [],
  hints = null,
  schemes = [],
}) {
  if (!isAiEnabled()) {
    const err = new Error('Gemini API key is not configured on the server.');
    err.code = 'AI_NOT_CONFIGURED';
    err.status = 503;
    throw err;
  }

  const relevantSchemes = retrieveRelevantSchemes(message, schemes, hints, 6);
  const systemInstruction = buildSystemInstruction(languageName, relevantSchemes);

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Format recent conversation turns safely (keep last 6 turns)
  const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
  const conversationLines = recentHistory
    .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.text === 'string')
    .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
    .join('\n');

  const promptContent = conversationLines
    ? `Recent conversation:\n${conversationLines}\n\nCurrent user question: ${message}`
    : message;

  const attempts = [
    {
      model: 'gemini-4-hydrogen',
      config: { systemInstruction, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
      delayBeforeMs: 0,
    },
    {
      model: 'gemini-4-hydrogen',
      config: { systemInstruction, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
      delayBeforeMs: 1200,
    },
    {
      model: 'gemini-3.1-flash-lite',
      config: { systemInstruction },
      delayBeforeMs: 2000,
    },
  ];

  let lastErr = null;
  let response = null;

  for (const attempt of attempts) {
    if (attempt.delayBeforeMs > 0) {
      await sleep(attempt.delayBeforeMs);
    }
    try {
      response = await generateWithTimeout(
        ai,
        attempt.model,
        promptContent,
        attempt.config,
        20000
      );
      if (response?.text?.trim()) {
        break;
      }
    } catch (err) {
      lastErr = err;
      if (!isTransientError(err) && err.code !== 'AI_TIMEOUT') {
        break;
      }
    }
  }

  if (!response) {
    const err = lastErr || new Error('AI request failed.');
    if (err.code === 'AI_TIMEOUT' || err.code === 'AI_NOT_CONFIGURED') {
      throw err;
    }

    const msg = String(err?.message || '');
    const status = err?.status;
    if (status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.toLowerCase().includes('quota')) {
      const quotaErr = new Error(
        'The AI assistant is currently busy due to API rate limits. Please wait a moment and try again.'
      );
      quotaErr.code = 'AI_QUOTA';
      quotaErr.status = 429;
      throw quotaErr;
    }
    if (status === 403 || status === 400 || msg.includes('403') || msg.includes('400') || msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED')) {
      const authErr = new Error('The configured Gemini API key appears invalid or lacks permission.');
      authErr.code = 'AI_AUTH_ERROR';
      authErr.status = 502;
      throw authErr;
    }
    if (isTransientError(err)) {
      const busyErr = new Error(
        'The AI service is temporarily busy. Please try again in a moment.'
      );
      busyErr.code = 'AI_UNAVAILABLE';
      busyErr.status = 503;
      throw busyErr;
    }

    const genericErr = new Error('Unable to reach the AI assistant right now. Please try again.');
    genericErr.code = 'AI_ERROR';
    genericErr.status = 502;
    throw genericErr;
  }

  const answer = response?.text?.trim();
  if (!answer) {
    const emptyErr = new Error('Received an empty response from the AI service. Please try again.');
    emptyErr.code = 'AI_EMPTY';
    emptyErr.status = 502;
    throw emptyErr;
  }

  // Collect unique source links from the retrieved schemes
  const seenUrls = new Set();
  const sources = [];
  for (const s of relevantSchemes) {
    for (const link of s.source_links || []) {
      if (!seenUrls.has(link.url)) {
        seenUrls.add(link.url);
        sources.push({
          schemeId: s.id,
          schemeName: s.name_en,
          label: link.label,
          url: link.url,
        });
      }
    }
  }

  return { answer, sources };
}
