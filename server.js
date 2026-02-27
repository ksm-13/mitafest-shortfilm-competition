/**
 * The Box Office - Short Film Competition
 * Backend Server (Node.js + Express + SQLite)
 * Run: node server.js
 */

const express    = require('express');
const Database   = require('better-sqlite3');
const multer     = require('multer');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');

// ── Config ─────────────────────────────────────────────────────────────────
const PORT         = process.env.PORT || 3000;
const ADMIN_PASS   = process.env.ADMIN_PASS || 'boxoffice2025';
const UPLOADS_DIR  = path.join(__dirname, 'uploads');
const DB_PATH      = path.join(__dirname, 'registrations.db');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// ── Database setup ──────────────────────────────────────────────────────────
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    submitted_at TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    status       TEXT    NOT NULL DEFAULT 'pending',

    film_name    TEXT NOT NULL,
    synopsis     TEXT NOT NULL,
    film_link    TEXT NOT NULL,
    payment_file TEXT,

    tm1_name     TEXT, tm1_phone TEXT, tm1_email TEXT, tm1_role TEXT, tm1_college TEXT,
    tm2_name     TEXT, tm2_phone TEXT, tm2_email TEXT, tm2_role TEXT, tm2_college TEXT,
    tm3_name     TEXT, tm3_role  TEXT, tm3_college TEXT,
    tm4_name     TEXT, tm4_role  TEXT, tm4_college TEXT,
    tm5_name     TEXT, tm5_role  TEXT, tm5_college TEXT,
    tm6_name     TEXT, tm6_role  TEXT, tm6_college TEXT,
    tm7_name     TEXT, tm7_role  TEXT, tm7_college TEXT,
    tm8_name     TEXT, tm8_role  TEXT, tm8_college TEXT,
    tm9_name     TEXT, tm9_role  TEXT, tm9_college TEXT,
    tm10_name    TEXT, tm10_role TEXT, tm10_college TEXT,
    tm11_name    TEXT, tm11_role TEXT, tm11_college TEXT,
    tm12_name    TEXT, tm12_role TEXT, tm12_college TEXT,
    tm13_name    TEXT, tm13_role TEXT, tm13_college TEXT,
    tm14_name    TEXT, tm14_role TEXT, tm14_college TEXT,
    tm15_name    TEXT, tm15_role TEXT, tm15_college TEXT,
    total_members INTEGER DEFAULT 0
  )
`);

// ── File upload (payment screenshots) ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `pay_${Date.now()}_${Math.random().toString(36).slice(2,7)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP allowed'));
  }
});

// ── Express setup ───────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR)); // serve payment screenshots

// ── Admin auth middleware ───────────────────────────────────────────────────
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ═══════════════════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/register — submit a new registration
app.post('/api/register', upload.single('paymentFile'), (req, res) => {
  try {
    const b = req.body;

    // Basic required field check server-side
    const required = ['film_name','synopsis','film_link',
      'tm1_name','tm1_phone','tm1_email','tm1_role','tm1_college',
      'tm2_name','tm2_phone','tm2_email','tm2_role','tm2_college',
      'tm3_name','tm3_role','tm3_college',
      'tm4_name','tm4_role','tm4_college'];
    const missing = required.filter(k => !b[k]?.trim());
    if (missing.length) return res.status(400).json({ error: 'Missing required fields', fields: missing });
    if (!req.file)      return res.status(400).json({ error: 'Payment screenshot is required' });

    // Count members
    let total = 0;
    for (let i = 1; i <= 15; i++) if (b[`tm${i}_name`]?.trim()) total++;

    const insert = db.prepare(`
      INSERT INTO registrations (
        film_name, synopsis, film_link, payment_file,
        tm1_name,tm1_phone,tm1_email,tm1_role,tm1_college,
        tm2_name,tm2_phone,tm2_email,tm2_role,tm2_college,
        tm3_name,tm3_role,tm3_college,
        tm4_name,tm4_role,tm4_college,
        tm5_name,tm5_role,tm5_college,
        tm6_name,tm6_role,tm6_college,
        tm7_name,tm7_role,tm7_college,
        tm8_name,tm8_role,tm8_college,
        tm9_name,tm9_role,tm9_college,
        tm10_name,tm10_role,tm10_college,
        tm11_name,tm11_role,tm11_college,
        tm12_name,tm12_role,tm12_college,
        tm13_name,tm13_role,tm13_college,
        tm14_name,tm14_role,tm14_college,
        tm15_name,tm15_role,tm15_college,
        total_members
      ) VALUES (
        @film_name,@synopsis,@film_link,@payment_file,
        @tm1_name,@tm1_phone,@tm1_email,@tm1_role,@tm1_college,
        @tm2_name,@tm2_phone,@tm2_email,@tm2_role,@tm2_college,
        @tm3_name,@tm3_role,@tm3_college,
        @tm4_name,@tm4_role,@tm4_college,
        @tm5_name,@tm5_role,@tm5_college,
        @tm6_name,@tm6_role,@tm6_college,
        @tm7_name,@tm7_role,@tm7_college,
        @tm8_name,@tm8_role,@tm8_college,
        @tm9_name,@tm9_role,@tm9_college,
        @tm10_name,@tm10_role,@tm10_college,
        @tm11_name,@tm11_role,@tm11_college,
        @tm12_name,@tm12_role,@tm12_college,
        @tm13_name,@tm13_role,@tm13_college,
        @tm14_name,@tm14_role,@tm14_college,
        @tm15_name,@tm15_role,@tm15_college,
        @total_members
      )
    `);

    const row = { ...b, payment_file: req.file.filename, total_members: total };
    for (let i = 1; i <= 15; i++) {
      row[`tm${i}_name`]    = b[`tm${i}_name`]    || null;
      row[`tm${i}_role`]    = b[`tm${i}_role`]    || null;
      row[`tm${i}_college`] = b[`tm${i}_college`] || null;
    }
    const info = insert.run(row);
    res.json({ success: true, id: info.lastInsertRowid });

  } catch (err) {
    console.error(err);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
//  ADMIN ROUTES (all protected)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/admin/login — validate password, return token (simple shared secret)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Incorrect password' });
  res.json({ token: ADMIN_PASS }); // in production, use JWT
});

// GET /api/admin/registrations — list all registrations
app.get('/api/admin/registrations', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM registrations ORDER BY submitted_at DESC').all();
  res.json(rows);
});

// GET /api/admin/registrations/:id — single registration
app.get('/api/admin/registrations/:id', adminAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// PATCH /api/admin/registrations/:id/status — update payment status
app.patch('/api/admin/registrations/:id/status', adminAuth, (req, res) => {
  const { status } = req.body;
  if (!['pending','verified','rejected'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  const info = db.prepare('UPDATE registrations SET status = ? WHERE id = ?').run(status, req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// DELETE /api/admin/registrations/:id
app.delete('/api/admin/registrations/:id', adminAuth, (req, res) => {
  const row = db.prepare('SELECT payment_file FROM registrations WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM registrations WHERE id = ?').run(req.params.id);
  if (row.payment_file) {
    const filePath = path.join(UPLOADS_DIR, row.payment_file);
    fs.unlink(filePath, () => {});
  }
  res.json({ success: true });
});

// GET /api/admin/stats — summary stats
app.get('/api/admin/stats', adminAuth, (req, res) => {
  const total    = db.prepare('SELECT COUNT(*) as n FROM registrations').get().n;
  const pending  = db.prepare("SELECT COUNT(*) as n FROM registrations WHERE status='pending'").get().n;
  const verified = db.prepare("SELECT COUNT(*) as n FROM registrations WHERE status='verified'").get().n;
  const rejected = db.prepare("SELECT COUNT(*) as n FROM registrations WHERE status='rejected'").get().n;
  const avgTeam  = db.prepare('SELECT AVG(total_members) as a FROM registrations').get().a || 0;
  res.json({ total, pending, verified, rejected, revenue: verified * 300, avgTeam: avgTeam.toFixed(1) });
});

// GET /api/admin/export/csv — download all as CSV
app.get('/api/admin/export/csv', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM registrations ORDER BY submitted_at DESC').all();
  if (!rows.length) return res.status(404).json({ error: 'No data' });

  const cols = Object.keys(rows[0]);
  const csv  = [
    cols.join(','),
    ...rows.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="registrations_${new Date().toISOString().slice(0,10)}.csv"`);
  res.send(csv);
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  The Box Office - Backend running`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Admin:   http://localhost:${PORT}  (password: ${ADMIN_PASS})\n`);
});
