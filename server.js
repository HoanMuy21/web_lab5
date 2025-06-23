const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();

// ✅ DÙNG PORT từ biến môi trường Railway cấp (rất quan trọng)
const port = process.env.PORT || 3000;

// Kết nối PostgreSQL (nếu dùng database)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Route test DB
app.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Database time: ${result.rows[0].now}`);
  } catch (err) {
    res.status(500).send('Lỗi kết nối database: ' + err.message);
  }
});

// Gửi file index.html khi truy cập "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ BẮT ĐẦU SERVER tại cổng Railway cấp
app.listen(port, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${port}`);
});
