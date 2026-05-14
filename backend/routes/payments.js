// routes/payments.js - Управление платежами
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/payments/:objectId - Добавить платёж
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/:objectId', auth, async (req, res) => {
  try {
    const { objectId } = req.params;
    const { amount, payment_date, note } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount required' });
    }

    // Проверяем, что объект принадлежит пользователю
    const objCheck = await pool.query(
      'SELECT id FROM objects WHERE id=$1 AND user_id=$2',
      [objectId, req.userId]
    );

    if (objCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Object not found or access denied' });
    }

    // Добавляем платёж
    const result = await pool.query(
      'INSERT INTO payments (object_id, amount, payment_date, note) VALUES ($1, $2, $3, $4) RETURNING *',
      [objectId, amount, payment_date, note]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add payment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/payments/:objectId - Получить платежи объекта
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/:objectId', auth, async (req, res) => {
  try {
    const { objectId } = req.params;

    // Проверяем доступ
    const objCheck = await pool.query(
      'SELECT id FROM objects WHERE id=$1 AND user_id=$2',
      [objectId, req.userId]
    );

    if (objCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'SELECT id, amount, payment_date, note FROM payments WHERE object_id=$1 ORDER BY payment_date DESC',
      [objectId]
    );

    const total = result.rows.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    res.json({
      payments: result.rows,
      total: total
    });
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/payments/:id - Удалить платёж
// ═══════════════════════════════════════════════════════════════════════════════
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, что платёж принадлежит объекту пользователя
    const check = await pool.query(
      `SELECT p.id FROM payments p
       JOIN objects o ON p.object_id = o.id
       WHERE p.id=$1 AND o.user_id=$2`,
      [id, req.userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Payment not found or access denied' });
    }

    const result = await pool.query('DELETE FROM payments WHERE id=$1 RETURNING id', [id]);

    res.json({ message: 'Payment deleted', id: result.rows[0].id });
  } catch (err) {
    console.error('Delete payment error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
