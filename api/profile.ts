// Example: GET /api/profile?uid=USER_ID
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { uid } = req.query;
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Missing uid' });
  }
  try {
    const doc = await db.collection('profiles').doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.status(200).json(doc.data());
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
}
