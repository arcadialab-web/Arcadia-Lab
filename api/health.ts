import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'Le API di Vercel sono attive!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    url_richiesta: req.url
  });
}
