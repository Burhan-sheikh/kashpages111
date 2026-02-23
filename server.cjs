// Simple Express server to serve API endpoints for local development
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

// Load environment variables from .env if present
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

// API: Get profile
app.get('/api/profile', async (req, res) => {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: 'Missing uid' });
  try {
    const doc = await db.collection('profiles').doc(uid).get();
    if (!doc.exists) return res.status(404).json({ error: 'Profile not found' });
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// API: Update profile
app.patch('/api/profile-update', async (req, res) => {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: 'Missing uid' });
  try {
    await db.collection('profiles').doc(uid).update(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// API: Get shop
app.get('/api/shop', async (req, res) => {
  const { shopId } = req.query;
  if (!shopId) return res.status(400).json({ error: 'Missing shopId' });
  try {
    const doc = await db.collection('shops').doc(shopId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Shop not found' });
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// API: Update shop
app.patch('/api/shop-update', async (req, res) => {
  const { shopId } = req.query;
  if (!shopId) return res.status(400).json({ error: 'Missing shopId' });
  try {
    await db.collection('shops').doc(shopId).update(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// API: Create shop
app.post('/api/shop-create', async (req, res) => {
  try {
    const docRef = await db.collection('shops').add(req.body);
    res.json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// API: Get roles
app.get('/api/roles', async (req, res) => {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: 'Missing uid' });
  try {
    const snap = await db.collection('user_roles').where('user_id', '==', uid).get();
    const roles = snap.docs.map(doc => doc.data().role);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Serve static files (Vite dev server runs separately)
app.use(express.static(path.join(__dirname, 'dist')));

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
