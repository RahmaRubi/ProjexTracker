const pool = require('../config/db');
const { validationResult } = require('express-validator');

// GET /api/projects
const getAll = async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin') {
      query = `
        SELECT p.*, u.name AS client_name, u.email AS client_email
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        ORDER BY p.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT p.*, u.name AS client_name, u.email AS client_email
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        WHERE p.client_id = ?
        ORDER BY p.created_at DESC
      `;
      params = [req.user.id];
    }

    const [projects] = await pool.query(query, params);
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/projects/:id
const getOne = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS client_name, u.email AS client_email
       FROM projects p
       LEFT JOIN users u ON p.client_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Project not found' });

    const project = rows[0];

    // Clients can only view their own projects
    if (req.user.role === 'client' && project.client_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/projects (admin only)
const create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { project_name, description, status, progress_percentage, start_date, expected_completion, client_id } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO projects (project_name, description, status, progress_percentage, start_date, expected_completion, client_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [project_name, description, status || 'planning', progress_percentage || 0, start_date || null, expected_completion || null, client_id || null]
    );

    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.status(201).json({ project: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/projects/:id (admin only)
const update = async (req, res) => {
  const { project_name, description, status, progress_percentage, start_date, expected_completion, client_id } = req.body;

  try {
    await pool.query(
      `UPDATE projects SET
        project_name = COALESCE(?, project_name),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        progress_percentage = COALESCE(?, progress_percentage),
        start_date = COALESCE(?, start_date),
        expected_completion = COALESCE(?, expected_completion),
        client_id = COALESCE(?, client_id)
       WHERE id = ?`,
      [project_name, description, status, progress_percentage, start_date, expected_completion, client_id, req.params.id]
    );

    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Project not found' });

    res.json({ project: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/projects/:id (admin only)
const remove = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM projects WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Project not found' });

    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/projects/clients (admin only - get list of clients for dropdown)
const getClients = async (req, res) => {
  try {
    const [clients] = await pool.query('SELECT id, name, email FROM users WHERE role = ?', ['client']);
    res.json({ clients });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove, getClients };
