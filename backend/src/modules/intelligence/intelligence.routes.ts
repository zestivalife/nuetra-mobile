import { Router } from 'express';
import { checkinSchema, generateOnePriority } from './intelligence.service.js';

export const intelligenceRouter = Router();

intelligenceRouter.post('/priority', (req, res) => {
  const parsed = checkinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const response = generateOnePriority(parsed.data);
  return res.json(response);
});
