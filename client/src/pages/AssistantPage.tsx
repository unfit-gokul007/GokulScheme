import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ExternalLink,
  KeyRound,
  RefreshCw,
  Send,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../context/AppStateContext';
import { getLanguageMeta } from '../i18n/languages';
import { fetchHealth, sendChatMessage } from '../lib/api';
import { detectPII } from '../lib/piiGuard';

export function AssistantPage() {
  const { t, i18n } = useTranslation();
  const {
    profile,
    chatMessages,
    setChatMessages,
    clearChat,
    shareHints,
    setShareHints,
  } = useAppState();

  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [input, setInput] = useState('');
  const [piiWarning, setPiiWarning] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const checkHealth = async () => {
    setHealthError(false);
    try {
      const data = await fetchHealth();
      setAiEnabled(data.aiEnabled);
    } catch {
      setHealthError(true);
      setAiEnabled(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const suggestions = [
    t('assistant.suggestion1'),
    t('assistant.suggestion2'),
    t('assistant.suggestion3'),
    t('assistant.suggestion4'),
  ];

  const handleSend = async (textToSend?: string) => {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || sending) return;

    const pii = detectPII(trimmed);
    if (pii.blocked) {
      setPiiWarning(pii.message);
      return;
    }

    setPiiWarning(null);
    setLastFailedMessage(null);

    const userMsgId = `u-${Date.now()}`;
    const nextHistory = [
      ...chatMessages,
      { id: userMsgId, role: 'user' as const, text: trimmed },
    ];
    setChatMessages(nextHistory);
    if (!textToSend) setInput('');
    setSending(true);

    const langMeta = getLanguageMeta(i18n.language);

    try {
      const result = await sendChatMessage({
        message: trimmed,
        language: langMeta.code,
        languageName: langMeta.englishName,
        history: chatMessages,
        shareHints,
        hints: shareHints
          ? {
              state: profile.state || null,
              category: null,
              occupation: profile.occupation || null,
            }
          : null,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: result.answer,
          sources: result.sources,
        },
      ]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to reach the AI assistant right now. Please try again.';
      setLastFailedMessage(trimmed);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          text: msg,
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#0B1F3A] sm:text-3xl">
            {t('assistant.title')}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
            {t('assistant.subtitle')}
          </p>
        </div>

        {chatMessages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearChat();
              setPiiWarning(null);
              setLastFailedMessage(null);
            }}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 self-start rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span>{t('assistant.clearChat')}</span>
          </button>
        )}
      </div>

      {/* Privacy Notice */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
      >
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <p className="font-medium leading-relaxed">{t('assistant.privacyNote')}</p>
      </div>

      {/* No API Key Friendly Setup Panel */}
      {aiEnabled === false && (
        <section
          aria-live="polite"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
        >
          <div className="flex items-start gap-3.5">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A]/5 text-[#0B1F3A]">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
                {t('assistant.noKeyTitle')}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {t('assistant.noKeyBody')}
              </p>
              <ol className="list-decimal space-y-1.5 ps-5 text-sm text-slate-800">
                <li>
                  Copy <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">.env.example</code> to{' '}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">.env</code>
                </li>
                <li>
                  Set <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">GEMINI_API_KEY</code> in{' '}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">.env</code>
                </li>
                <li>{t('assistant.noKeyStep3')}</li>
              </ol>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/discover"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-[#FF9933] px-5 py-2.5 text-sm font-bold text-[#0B1F3A] hover:bg-[#ffaa4d]"
                >
                  {t('hero.cta')}
                </Link>
                <Link
                  to="/schemes"
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B1F3A] hover:bg-slate-50"
                >
                  {t('hero.secondaryCta')}
                </Link>
                {healthError && (
                  <button
                    type="button"
                    onClick={checkHealth}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    <span>{t('common.retry')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grounded Chat Interface (shown when aiEnabled === true) */}
      {aiEnabled === true && (
        <div className="space-y-4">
          {/* Opt-in Coarse Profile Hints Toggle (OFF by default) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={shareHints}
                onChange={(e) => setShareHints(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0E4D58]"
              />
              <div>
                <span className="block text-sm font-semibold text-[#0B1F3A]">
                  {t('assistant.shareHintsLabel')}
                </span>
                <span className="block text-xs text-slate-500">
                  {t('assistant.shareHintsHint')}
                </span>
              </div>
            </label>
          </div>

          {/* Suggested Questions */}
          {chatMessages.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xs font-bold tracking-wide text-slate-600">
                {t('assistant.suggestionsLabel')}
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="min-h-[44px] rounded-xl border border-slate-200 bg-[#FAF9F5] px-4 py-2.5 text-start text-sm font-medium text-[#0B1F3A] transition-colors hover:border-[#0E4D58] hover:bg-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Thread */}
          {chatMessages.length > 0 && (
            <div
              aria-live="polite"
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
            >
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[82%] ${
                      msg.role === 'user'
                        ? 'bg-[#0B1F3A] text-white'
                        : msg.isError
                        ? 'border border-red-200 bg-red-50 text-red-900'
                        : 'border border-slate-200 bg-[#FAF9F5] text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {msg.isError && lastFailedMessage && (
                      <button
                        type="button"
                        onClick={() => handleSend(lastFailedMessage)}
                        className="mt-2 inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                      >
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t('common.retry')}</span>
                      </button>
                    )}

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 border-t border-slate-200/80 pt-2.5">
                        <p className="text-xs font-bold text-slate-600">
                          {t('assistant.sourcesCited')}:
                        </p>
                        <ul className="mt-1 space-y-1 text-xs">
                          {msg.sources.map((src) => (
                            <li key={`${src.schemeId}-${src.url}`}>
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-[#0E4D58] underline underline-offset-2 hover:text-[#0B1F3A]"
                              >
                                <span>
                                  {src.schemeName} — {src.label}
                                </span>
                                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="text-sm font-medium text-slate-500">
                  {t('assistant.sending')}
                </div>
              )}
            </div>
          )}

          {/* PII Warning Banner */}
          {piiWarning && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm font-medium text-red-900"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
              <span>{piiWarning}</span>
            </div>
          )}

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex flex-col gap-2.5 sm:flex-row"
          >
            <label htmlFor="chat-input" className="sr-only">
              {t('assistant.placeholder')}
            </label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (piiWarning) setPiiWarning(null);
              }}
              placeholder={t('assistant.placeholder')}
              maxLength={800}
              className="min-h-[48px] flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B1F3A]"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF9933] px-6 py-2.5 text-sm font-bold text-[#0B1F3A] transition-colors hover:bg-[#ffaa4d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>{t('assistant.send')}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
