const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SPEAKER ORDER BY Name');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SPEAKER WHERE Speaker_ID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Speaker not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { name, bio } = req.body;
  try {
    const [result] = await db.query('INSERT INTO SPEAKER (Name, Bio) VALUES (?, ?)', [name, bio]);
    res.status(201).json({ message: 'Speaker created', speakerId: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { name, bio } = req.body;
  try {
    await db.query('UPDATE SPEAKER SET Name=?, Bio=? WHERE Speaker_ID=?', [name, bio, req.params.id]);
    res.json({ message: 'Speaker updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM SPEAKER WHERE Speaker_ID = ?', [req.params.id]);
    res.json({ message: 'Speaker deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
