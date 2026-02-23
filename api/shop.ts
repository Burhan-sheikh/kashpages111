// Example: GET /api/shop?shopId=SHOP_ID
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { shopId } = req.query;
  if (!shopId || typeof shopId !== 'string') {
    return res.status(400).json({ error: 'Missing shopId' });
  }
  try {
    const doc = await db.collection('shops').doc(shopId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    return res.status(200).json(doc.data());
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: String(err) });
  }
}
