import { Router } from 'express';
import { z } from 'zod';
import { getAllSchemes } from '../repo/schemeRepo.js';
import { detectPII } from '../services/piiGuard.js';
import { generateGroundedAnswer, isAiEnabled } from '../services/ai.js';

const router = Router();

const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Please enter a question.').max(800, 'Question is too long (max 800 characters).'),
  language: z.string().max(16).optional().default('en'),
  languageName: z.string().max(50).optional().default('English'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().max(2000),
      })
    )
    .max(12)
    .optional()
    .default([]),
  shareHints: z.boolean().optional().default(false),
  hints: z
    .object({
      state: z.string().max(60).nullable().optional(),
      category: z.string().max(60).nullable().optional(),
      occupation: z.string().max(60).nullable().optional(),
    })
    .nullable()
    .optional(),
});

router.post('/', async (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'INVALID_CHAT_REQUEST',
        message: 'Please enter a valid question under 800 characters.',
        details: parsed.error.flatten().fieldErrors,
      },
    });
  }

  const { message, languageName, history, shareHints, hints } = parsed.data;

  // PII check on server (do not log message)
  const piiCheck = detectPII(message);
  if (piiCheck.blocked) {
    return res.status(400).json({
      error: {
        code: 'PII_DETECTED',
        message: piiCheck.message,
        reasons: piiCheck.reasons,
      },
    });
  }

  if (!isAiEnabled()) {
    return res.status(503).json({
      error: {
        code: 'AI_NOT_CONFIGURED',
        message: 'Gemini API key is not configured on the server.',
      },
    });
  }

  // Strictly enforce privacy: only forward coarse state/category/occupation if shareHints is true
  const sanitizedHints =
    shareHints && hints
      ? {
          state: hints.state || null,
          category: hints.category || null,
          occupation: hints.occupation || null,
        }
      : null;

  try {
    const schemes = getAllSchemes();
    const result = await generateGroundedAnswer({
      message,
      languageName,
      history,
      hints: sanitizedHints,
      schemes,
    });

    return res.json(result);
  } catch (err) {
    const status = err.status || 502;
    return res.status(status).json({
      error: {
        code: err.code || 'AI_ERROR',
        message: err.message || 'Unable to generate a response right now. Please try again.',
      },
    });
  }
});

export default router;
