const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const serviceAccount = require('./hyperlink-web-firebase-adminsdk-fbsvc-e3720ddf50.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://hyperlink-web-default-rtdb.firebaseio.com'
});

const db = admin.database();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de multer para subir imágenes a memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/api/products', async (req, res) => {
  try {
    const ref = db.ref('products');
    const snapshot = await ref.once('value');
    const products = snapshot.val() || {};
    res.json(Object.values(products));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const image = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : '';
    const ref = db.ref('products').push();
    await ref.set({ id: ref.key, name, price, image, description });
    res.json({ id: ref.key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;
    const updateData = { name, price, description };
    if (req.file) {
      updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    const ref = db.ref(`products/${id}`);
    await ref.update(updateData);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.ref(`products/${id}`);
    await ref.remove();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/advisors', async (req, res) => {
  try {
    const ref = db.ref('advisors');
    const snapshot = await ref.once('value');
    const advisors = snapshot.val() || {};
    res.json(Object.values(advisors));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/advisors', async (req, res) => {
  try {
    const { name, number } = req.body;
    const ref = db.ref('advisors').push();
    await ref.set({ id: ref.key, name, number });
    res.json({ id: ref.key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/advisors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, number } = req.body;
    const ref = db.ref(`advisors/${id}`);
    await ref.update({ name, number });
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/advisors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.ref(`advisors/${id}`);
    await ref.remove();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
