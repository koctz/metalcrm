// routes/contacts.js - Управление контактами
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/contacts/:objectId - Добавить контакт
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/:objectId', auth, async (req, res) => {
  try {
    const { objectId } = req.params;
    const { name, position, phone, email } = req.body;

    if (!name || (!phone && !email)) {
      return res.status(400).json({ error: 'Name and (phone or email) required' });
    }

    // Проверяем доступ к объекту
    const objCheck = await pool.query(
      'SELECT id FROM objects WHERE id=$1 AND user_id=$2',
      [objectId, req.userId]
    );

    if (objCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Object not found or access denied' });
    }

    const result = await pool.query(
      'INSERT INTO contacts (object_id, name, position, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [objectId, name, position, phone, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add contact error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/contacts/:objectId - Получить контакты объекта
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
      'SELECT id, name, position, phone, email, created_at FROM contacts WHERE object_id=$1 ORDER BY created_at DESC',
      [objectId]
    );

    res.json({
      contacts: result.rows
    });
  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/contacts/:id - Удалить контакт
// ═══════════════════════════════════════════════════════════════════════════════
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем доступ
    const check = await pool.query(
      `SELECT c.id FROM contacts c
       JOIN objects o ON c.object_id = o.id
       WHERE c.id=$1 AND o.user_id=$2`,
      [id, req.userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Contact not found or access denied' });
    }

    const result = await pool.query('DELETE FROM contacts WHERE id=$1 RETURNING id', [id]);

    res.json({ message: 'Contact deleted', id: result.rows[0].id });
  } catch (err) {
    console.error('Delete contact error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
