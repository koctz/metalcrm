// routes/team.js - Аналитика команды и КПИ менеджеров
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/team - Портфель всех менеджеров (если админ)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/', auth, async (req, res) => {
  try {
    // Получаем всех менеджеров с их статистикой
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.full_name,
        COUNT(o.id) as objects_count,
        SUM(o.weight) as total_weight,
        SUM(o.contract) as total_contract,
        SUM(COALESCE(p.amount, 0)) as total_paid,
        COUNT(DISTINCT CASE WHEN o.status != 'Сделка завершена' THEN o.id END) as active_objects
      FROM users u
      LEFT JOIN objects o ON u.id = o.user_id
      LEFT JOIN payments p ON o.id = p.object_id
      GROUP BY u.id, u.username, u.full_name
      ORDER BY total_contract DESC NULLS LAST
    `);

    const team = result.rows.map(manager => ({
      id: manager.id,
      name: manager.full_name || manager.username,
      objects_count: parseInt(manager.objects_count) || 0,
      total_weight: parseFloat(manager.total_weight) || 0,
      total_contract: parseFloat(manager.total_contract) || 0,
      total_paid: parseFloat(manager.total_paid) || 0,
      active_objects: parseInt(manager.active_objects) || 0,
      payment_percentage: manager.total_contract ? 
        Math.round((parseFloat(manager.total_paid) / parseFloat(manager.total_contract)) * 100) : 0
    }));

    res.json({
      count: team.length,
      team: team
    });
  } catch (err) {
    console.error('Get team error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/team/my-stats - Мои КПИ (текущего менеджера)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/my-stats', auth, async (req, res) => {
  try {
    // Статистика текущего менеджера
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.full_name,
        COUNT(o.id) as objects_count,
        SUM(o.weight) as total_weight,
        SUM(o.contract) as total_contract,
        SUM(COALESCE(p.amount, 0)) as total_paid,
        COUNT(DISTINCT CASE WHEN o.status != 'Сделка завершена' THEN o.id END) as active_objects,
        COUNT(DISTINCT CASE WHEN o.status = 'Сделка завершена' THEN o.id END) as completed_objects
      FROM users u
      LEFT JOIN objects o ON u.id = o.user_id
      LEFT JOIN payments p ON o.id = p.object_id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.full_name
    `, [req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = result.rows[0];

    const response = {
      id: stats.id,
      name: stats.full_name || stats.username,
      objects_count: parseInt(stats.objects_count) || 0,
      total_weight: parseFloat(stats.total_weight) || 0,
      total_contract: parseFloat(stats.total_contract) || 0,
      total_paid: parseFloat(stats.total_paid) || 0,
      active_objects: parseInt(stats.active_objects) || 0,
      completed_objects: parseInt(stats.completed_objects) || 0,
      payment_percentage: stats.total_contract ? 
        Math.round((parseFloat(stats.total_paid) / parseFloat(stats.total_contract)) * 100) : 0,
      average_deal_value: stats.objects_count ? 
        Math.round(parseFloat(stats.total_contract) / parseInt(stats.objects_count)) : 0
    };

    res.json(response);
  } catch (err) {
    console.error('Get my stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/team/:userId/stats - КПИ конкретного менеджера (админ)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/:userId/stats', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.full_name,
        COUNT(o.id) as objects_count,
        SUM(o.weight) as total_weight,
        SUM(o.contract) as total_contract,
        SUM(COALESCE(p.amount, 0)) as total_paid,
        COUNT(DISTINCT CASE WHEN o.status != 'Сделка завершена' THEN o.id END) as active_objects
      FROM users u
      LEFT JOIN objects o ON u.id = o.user_id
      LEFT JOIN payments p ON o.id = p.object_id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.full_name
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    const stats = result.rows[0];

    const response = {
      id: stats.id,
      name: stats.full_name || stats.username,
      objects_count: parseInt(stats.objects_count) || 0,
      total_weight: parseFloat(stats.total_weight) || 0,
      total_contract: parseFloat(stats.total_contract) || 0,
      total_paid: parseFloat(stats.total_paid) || 0,
      active_objects: parseInt(stats.active_objects) || 0,
      payment_percentage: stats.total_contract ? 
        Math.round((parseFloat(stats.total_paid) / parseFloat(stats.total_contract)) * 100) : 0
    };

    res.json(response);
  } catch (err) {
    console.error('Get manager stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
