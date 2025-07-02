import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

// Инициализация БД
let db: sqlite3.Database;
(async () => {
  db = await open({
    filename: './users.db',
    driver: sqlite3.Database
  });
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
})();

// Регистрация
app.post('/register', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ error: 'Логин и пароль обязательны' });
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.run('INSERT INTO users (login, password) VALUES (?, ?)', login, hash);
    return res.json({ ok: true });
  } catch (e: any) {
    if (e.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Пользователь уже существует' });
    }
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Логин
app.post('/login', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ error: 'Логин и пароль обязательны' });
  const user = await db.get('SELECT * FROM users WHERE login = ?', login);
  if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Неверный логин или пароль' });
  const token = jwt.sign({ login: user.login, id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token });
});

// Middleware для проверки JWT
function auth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Нет токена' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Неверный токен' });
  }
}

// Профиль
app.get('/profile', auth, async (req: any, res) => {
  const user = await db.get('SELECT id, login FROM users WHERE id = ?', req.user.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  return res.json({ user });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
}); 