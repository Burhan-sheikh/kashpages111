// Example: POST /api/shop-create
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const docRef = await db.collection('shops').add(req.body);
    return res.status(200).json({ id: docRef.id });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
}
