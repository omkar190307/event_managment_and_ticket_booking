const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../db');

const SECRET = process.env.JWT_SECRET || 'eventpro_secret_2026';

/* ─────────────────────────────────────────────
   HELPER – is value a mobile number?
───────────────────────────────────────────── */
const isMobile = (v) => /^[6-9]\d{9}$/.test(v.replace(/\s/g, ''));

/* ─────────────────────────────────────────────
   POST /api/users/register
───────────────────────────────────────────── */
router.post('/register', async (req, res) => {
  const { name, email, mobile, password, user_type } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required.' });

  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  try {
    // Check duplicate email
    const [byEmail] = await db.query('SELECT User_ID FROM USER WHERE Email = ?', [email]);
    if (byEmail.length) return res.status(409).json({ error: 'Email already registered.' });

    // Check duplicate mobile
    if (mobile) {
      const [byMobile] = await db.query('SELECT User_ID FROM USER WHERE Mobile = ?', [mobile]);
      if (byMobile.length) return res.status(409).json({ error: 'Mobile number already registered.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO USER (Name, Email, Mobile, Password, User_type) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), mobile || null, hashed, user_type || 'user']
    );

    const token = jwt.sign(
      { id: result.insertId, email, user_type: user_type || 'user' },
      SECRET, { expiresIn: '7d' }
    );

    res.status(201).json({
      message : 'Registration successful!',
      token,
      user: { id: result.insertId, name: name.trim(), email, mobile: mobile || null, user_type: user_type || 'user' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────
   POST /api/users/login
   Body: { identifier: "email or mobile", password }
───────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password)
    return res.status(400).json({ error: 'Email/mobile and password are required.' });

  try {
    // Find user by email OR mobile
    let rows;
    if (isMobile(identifier)) {
      [rows] = await db.query('SELECT * FROM USER WHERE Mobile = ?', [identifier.replace(/\s/g, '')]);
    } else {
      [rows] = await db.query('SELECT * FROM USER WHERE Email = ?', [identifier.toLowerCase().trim()]);
    }

    if (!rows.length) return res.status(404).json({ error: 'No account found with this email/mobile.' });

    const user = rows[0];
    if (!user.Is_active) return res.status(403).json({ error: 'Account is deactivated. Contact support.' });

    const match = await bcrypt.compare(password, user.Password);
    if (!match) return res.status(401).json({ error: 'Incorrect password.' });

    const token = jwt.sign(
      { id: user.User_ID, email: user.Email, user_type: user.User_type },
      SECRET, { expiresIn: '7d' }
    );

    res.json({
      message : 'Login successful!',
      token,
      user: {
        id       : user.User_ID,
        name     : user.Name,
        email    : user.Email,
        mobile   : user.Mobile,
        user_type: user.User_type
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────
   GET /api/users/profile/:id  (protected)
───────────────────────────────────────────── */
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required.' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired token.' }); }
};

router.get('/profile/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT User_ID, Name, Email, Mobile, User_type, Created_At FROM USER WHERE User_ID = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* GET all users – admin */
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT User_ID, Name, Email, Mobile, User_type, Is_active, Created_At FROM USER ORDER BY Created_At DESC'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
