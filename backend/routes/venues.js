const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM VENUE ORDER BY City');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM VENUE WHERE Venue_ID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { name, address, city, state, zipcode, capacity } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO VENUE (Name, Address, City, State, Zipcode, Capacity) VALUES (?, ?, ?, ?, ?, ?)',
      [name, address, city, state, zipcode, capacity]
    );
    res.status(201).json({ message: 'Venue created', venueId: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { name, address, city, state, zipcode, capacity } = req.body;
  try {
    await db.query(
      'UPDATE VENUE SET Name=?, Address=?, City=?, State=?, Zipcode=?, Capacity=? WHERE Venue_ID=?',
      [name, address, city, state, zipcode, capacity, req.params.id]
    );
    res.json({ message: 'Venue updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM VENUE WHERE Venue_ID = ?', [req.params.id]);
    res.json({ message: 'Venue deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
