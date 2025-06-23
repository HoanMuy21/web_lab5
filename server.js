const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Cấu hình PostgreSQL từ Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(express.static(__dirname)); // phục vụ index.html, CSS, JS
app.use(express.json());

// API: Welcome message từ biến môi trường (có thể set trên Railway)
app.get('/config', (req, res) => {
  res.json({
    WELCOME_MESSAGE: process.env.WELCOME_MESSAGE || 'Chào Mừng Đến Với Ứng Dụng'
  });
});

// Khởi tạo bảng nếu chưa có
pool.query(`
  CREATE TABLE IF NOT EXISTS names (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
  )
`);

// GET: Lấy danh sách tên
app.get('/names', async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM names ORDER BY id DESC');
    const names = result.rows.map(row => row.name);
    res.json(names);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Thêm tên mới
app.post('/names', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Tên không được rỗng' });

  try {
    await pool.query('INSERT INTO names (name) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Sửa tên
app.patch('/names', async (req, res) => {
  const { oldName, newName } = req.body;
  if (!oldName || !newName) return res.status(400).json({ error: 'Thiếu tên cũ hoặc mới' });

  try {
    const result = await pool.query('UPDATE names SET name = $1 WHERE name = $2', [newName, oldName]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Tên cũ không tồn tại' });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Xóa 1 tên
app.delete('/names', async (req, res) => {
  const { name } = req.query;

  if (name) {
    try {
      const result = await pool.query('DELETE FROM names WHERE name = $1', [name]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Không tìm thấy tên để xóa' });
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    // Xóa tất cả
    try {
      await pool.query('DELETE FROM names');
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server chạy tại: http://localhost:${port}`);
});
