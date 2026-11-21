import { Router } from 'express';
import { z } from 'zod';
import { getAllSchemes, getSchemeById } from '../repo/schemeRepo.js';

const router = Router();

const listQuerySchema = z.object({
  level: z.enum(['all', 'central', 'state']).optional(),
  category: z.string().max(60).optional(),
  state: z.string().max(60).optional(),
  q: z.string().max(120).optional(),
});

router.get('/', (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'INVALID_QUERY',
        message: 'Invalid filter parameters.',
        details: parsed.error.flatten().fieldErrors,
      },
    });
  }

  const schemes = getAllSchemes(parsed.data);
  return res.json({ schemes, total: schemes.length });
});

router.get('/:id', (req, res) => {
  const id = String(req.params.id || '').trim();
  if (!id || id.length > 80 || !/^[a-z0-9-]+$/i.test(id)) {
    return res.status(400).json({
      error: { code: 'INVALID_ID', message: 'Invalid scheme identifier.' },
    });
  }

  const scheme = getSchemeById(id);
  if (!scheme) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Scheme not found.' },
    });
  }

  return res.json({ scheme });
});

export default router;
