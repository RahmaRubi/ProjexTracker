const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

// GET /api/documents?project_id=X
const getByProject = async (req, res) => {
  const { project_id } = req.query;
  if (!project_id) return res.status(400).json({ message: 'project_id is required' });

  try {
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [project_id]);
    if (!projects.length) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role === 'client' && projects[0].client_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [documents] = await pool.query(
      'SELECT * FROM documents WHERE project_id = ? ORDER BY uploaded_at DESC',
      [project_id]
    );
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/documents (with file upload)
const upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const { project_id } = req.body;
  if (!project_id) return res.status(400).json({ message: 'project_id is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO documents (project_id, file_name, file_path) VALUES (?, ?, ?)',
      [project_id, req.file.originalname, req.file.filename]
    );

    const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [result.insertId]);
    res.status(201).json({ document: rows[0] });
  } catch (err) {
    // Cleanup uploaded file on DB error
    fs.unlink(req.file.path, () => {});
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/documents/:id/download
const download = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Document not found' });

    const doc = rows[0];

    // Check project access
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [doc.project_id]);
    if (req.user.role === 'client' && projects[0]?.client_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadDir, doc.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, doc.file_name);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/documents/:id (admin only)
const remove = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Document not found' });

    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadDir, rows[0].file_path);
    if (fs.existsSync(filePath)) fs.unlink(filePath, () => {});

    await pool.query('DELETE FROM documents WHERE id = ?', [req.params.id]);
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getByProject, upload, download, remove };
