import { Router } from 'express';
import { z } from 'zod';
import { getAllSchemes } from '../repo/schemeRepo.js';
import { matchSchemes } from '../services/matching.js';

const router = Router();

const profileSchema = z.object({
  state: z.string().max(60).nullable().optional(),
  age: z
    .union([z.number().int().min(0).max(120), z.string().max(4), z.null()])
    .optional(),
  gender: z
    .enum(['female', 'male', 'other', 'prefer_not_to_say', 'skip', ''])
    .nullable()
    .optional(),
  casteCategory: z
    .enum(['General', 'OBC', 'SC', 'ST', 'prefer_not_to_say', 'skip', ''])
    .nullable()
    .optional(),
  incomeRange: z
    .enum(['under_1l', '1l_2.5l', '2.5l_5l', '5l_8l', 'above_8l', 'skip', ''])
    .nullable()
    .optional(),
  occupation: z
    .enum([
      'farmer',
      'student',
      'artisan',
      'street_vendor',
      'rural_worker',
      'micro_business',
      'salaried',
      'homemaker',
      'unemployed',
      'other',
      'skip',
      '',
    ])
    .nullable()
    .optional(),
  toggles: z
    .object({
      student: z.boolean().optional(),
      farmer: z.boolean().optional(),
      disability: z.boolean().optional(),
      bpl: z.boolean().optional(),
      minority: z.boolean().optional(),
      widow: z.boolean().optional(),
      senior_citizen: z.boolean().optional(),
    })
    .optional(),
});

router.post('/', (req, res) => {
  const parsed = profileSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'INVALID_PROFILE',
        message: 'Invalid profile fields submitted.',
        details: parsed.error.flatten().fieldErrors,
      },
    });
  }

  const profile = parsed.data;
  if (typeof profile.age === 'string') {
    const trimmed = profile.age.trim();
    if (trimmed === '') {
      profile.age = null;
    } else {
      const n = Number(trimmed);
      if (!Number.isInteger(n) || n < 0 || n > 120) {
        return res.status(400).json({
          error: { code: 'INVALID_AGE', message: 'Age must be between 0 and 120.' },
        });
      }
      profile.age = n;
    }
  }

  const schemes = getAllSchemes();
  const matches = matchSchemes(profile, schemes);

  return res.json({ matches, total: matches.length });
});

export default router;
