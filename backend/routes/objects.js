// routes/objects.js - Управление проектами (объектами)
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/objects - Все объекты менеджера
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/', auth, async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = 'SELECT * FROM objects WHERE user_id = $1';
    let params = [req.userId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    if (search) {
      query += ` AND (name ILIKE $${params.length + 1} OR client ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      objects: result.rows
    });
  } catch (err) {
    console.error('Get objects error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/objects/:id - Один объект с контактами и платежами
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Основная информация объекта
    const objResult = await pool.query(
      'SELECT * FROM objects WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (objResult.rows.length === 0) {
      return res.status(404).json({ error: 'Object not found' });
    }

    const obj = objResult.rows[0];

    // Контакты
    const contacts = await pool.query(
      'SELECT id, name, position, phone, email FROM contacts WHERE object_id = $1',
      [id]
    );

    // Платежи
    const payments = await pool.query(
      'SELECT id, amount, payment_date, note FROM payments WHERE object_id = $1 ORDER BY payment_date DESC',
      [id]
    );

    // Логи
    const logs = await pool.query(
      'SELECT id, text, type, created_at FROM logs WHERE object_id = $1 ORDER BY created_at DESC LIMIT 50',
      [id]
    );

    // Задачи
    const tasks = await pool.query(
      'SELECT id, text, deadline, done FROM tasks WHERE object_id = $1 ORDER BY deadline',
      [id]
    );

    res.json({
      ...obj,
      contacts: contacts.rows,
      payments: payments.rows,
      logs: logs.rows,
      tasks: tasks.rows
    });
  } catch (err) {
    console.error('Get object error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/objects - Создать новый объект
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/', auth, async (req, res) => {
  try {
    const { name, client, contact, weight, status, deadline, note, contract, contract_date } = req.body;

    if (!name || !weight) {
      return res.status(400).json({ error: 'Name and weight required' });
    }

    const result = await pool.query(
      `INSERT INTO objects (user_id, name, client, contact, weight, status, deadline, note, contract, contract_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.userId, name, client, contact, weight, status || 'В проработке', deadline, note, contract, contract_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create object error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/objects/:id - Обновить объект
// ═══════════════════════════════════════════════════════════════════════════════
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, client, contact, weight, status, deadline, note, contract, contract_date } = req.body;

    const result = await pool.query(
      `UPDATE objects 
       SET name=$1, client=$2, contact=$3, weight=$4, status=$5, deadline=$6, note=$7, contract=$8, contract_date=$9, updated_at=CURRENT_TIMESTAMP
       WHERE id=$10 AND user_id=$11
       RETURNING *`,
      [name, client, contact, weight, status, deadline, note, contract, contract_date, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Object not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update object error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/objects/:id - Удалить объект
// ═══════════════════════════════════════════════════════════════════════════════
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM objects WHERE id=$1 AND user_id=$2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Object not found' });
    }

    res.json({ message: 'Object deleted', id: result.rows[0].id });
  } catch (err) {
    console.error('Delete object error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
