// Example: GET /api/roles?uid=USER_ID
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { uid } = req.query;
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Missing uid' });
  }
  try {
    const snap = await db.collection('user_roles').where('user_id', '==', uid).get();
    const roles = snap.docs.map(doc => doc.data().role);
    return res.status(200).json(roles);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
}
