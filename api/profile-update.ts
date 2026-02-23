// Example: PATCH /api/profile?uid=USER_ID
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { uid } = req.query;
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Missing uid' });
  }
  try {
    await db.collection('profiles').doc(uid).update(req.body);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
}
