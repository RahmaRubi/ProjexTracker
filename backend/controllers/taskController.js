const pool = require('../config/db');

// GET /api/tasks?project_id=X
const getByProject = async (req, res) => {
  const { project_id } = req.query;
  if (!project_id) return res.status(400).json({ message: 'project_id is required' });

  try {
    // Check project access
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [project_id]);
    if (!projects.length) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role === 'client' && projects[0].client_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC',
      [project_id]
    );
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/tasks (admin only)
const create = async (req, res) => {
  const { title, description, project_id, status } = req.body;
  if (!title || !project_id) return res.status(400).json({ message: 'title and project_id are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, project_id, status) VALUES (?, ?, ?, ?)',
      [title, description, project_id, status || 'pending']
    );

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json({ task: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/tasks/:id
const update = async (req, res) => {
  const { title, description, status } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Task not found' });

    // Clients can only update status
    if (req.user.role === 'client') {
      await pool.query('UPDATE tasks SET status = COALESCE(?, status) WHERE id = ?', [status, req.params.id]);
    } else {
      await pool.query(
        'UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), status = COALESCE(?, status) WHERE id = ?',
        [title, description, status, req.params.id]
      );
    }

    const [updated] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ task: updated[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/tasks/:id (admin only)
const remove = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM tasks WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Task not found' });

    await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getByProject, create, update, remove };
