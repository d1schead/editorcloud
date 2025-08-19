import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const SECRET = process.env.JWT_SECRET || 'cambia_esto_en_produccion';
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a SQLite
const db = await open({
  filename: path.join(__dirname, 'database.sqlite'),
  driver: sqlite3.Database
});

// Crear tablas si no existen
await db.exec(`
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

// Middleware de autenticación
function auth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    await db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashed]);
    res.json({ ok: true });
  } catch (e) {
    if (String(e).includes('UNIQUE')) return res.status(409).json({ error: 'Usuario ya existe' });
    res.status(500).json({ error: 'Error al registrar' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  const user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
  if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Contraseña incorrecta' });
  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// Guardar documento
app.post('/save', auth, async (req, res) => {
  const { content } = req.body || {};
  if (typeof content !== 'string' || content.trim() === '') return res.status(400).json({ error: 'Contenido requerido' });
  await db.run(`INSERT INTO documents (user_id, content) VALUES (?, ?)`, [req.userId, content]);
  res.json({ ok: true });
});

// Listar documentos del usuario
app.get('/documents', auth, async (req, res) => {
  const docs = await db.all(`SELECT id, content, created_at FROM documents WHERE user_id = ? ORDER BY id DESC LIMIT 10`, [req.userId]);
  res.json(docs);
});

// Fallback para SPA simple
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
