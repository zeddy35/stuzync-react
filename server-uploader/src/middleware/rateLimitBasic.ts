import type { Request, Response, NextFunction } from 'express';

const windowMs = 60_000;
const maxRequests = 120;
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimitBasic(req: Request, res: Response, next: NextFunction) {
  const key = `${req.ip}`;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return next();
  }
  entry.count++;
  if (entry.count > maxRequests) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
}

