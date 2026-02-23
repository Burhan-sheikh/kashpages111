// Example: PATCH /api/shop?shopId=SHOP_ID
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { shopId } = req.query;
  if (!shopId || typeof shopId !== 'string') {
    return res.status(400).json({ error: 'Missing shopId' });
  }
  try {
    await db.collection('shops').doc(shopId).update(req.body);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
}
