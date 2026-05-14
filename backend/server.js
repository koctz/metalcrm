// server.js - Главный файл сервера
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const pool = require('./config/database');

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const objectRoutes = require('./routes/objects');
const paymentRoutes = require('./routes/payments');
const contactRoutes = require('./routes/contacts');
const teamRoutes = require('./routes/team');

const app = express();
const PORT = process.env.PORT || 5000;

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

// Логирование запросов
app.use(morgan('combined'));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Парсинг JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ═══════════════════════════════════════════════════════════════════════════════
// МАРШРУТЫ API
// ═══════════════════════════════════════════════════════════════════════════════

app.use('/api/auth', authRoutes);
app.use('/api/objects', objectRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/team', teamRoutes);

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTHCHECK
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ОБРАБОТКА ОШИБОК
// ═══════════════════════════════════════════════════════════════════════════════

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ПРОВЕРКА ПОДКЛЮЧЕНИЯ К БД И ЗАПУСК
// ═══════════════════════════════════════════════════════════════════════════════

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  } else {
    console.log('✅ Database connected:', res.rows[0]);
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          🚀 MetalCRM Backend Server Started                    ║
╠════════════════════════════════════════════════════════════════╣
║  API:      http://localhost:${PORT}                              ║
║  Health:   http://localhost:${PORT}/health                       ║
║  Mode:     ${process.env.NODE_ENV || 'development'}                           ║
║  Database: Connected ✅                                        ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
