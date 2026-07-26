const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all events (with speaker & venue info)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, s.Name AS Speaker_Name, s.Bio AS Speaker_Bio,
             v.Name AS Venue_Name, v.City, v.State, v.Capacity
      FROM EVENT e
      LEFT JOIN SPEAKER s ON e.Speaker_ID = s.Speaker_ID
      LEFT JOIN VENUE v ON e.Venue_ID = v.Venue_ID
      ORDER BY e.Date ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, s.Name AS Speaker_Name, s.Bio AS Speaker_Bio,
             v.Name AS Venue_Name, v.Address, v.City, v.State, v.Zipcode, v.Capacity
      FROM EVENT e
      LEFT JOIN SPEAKER s ON e.Speaker_ID = s.Speaker_ID
      LEFT JOIN VENUE v ON e.Venue_ID = v.Venue_ID
      WHERE e.Event_ID = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE event (admin)
router.post('/', async (req, res) => {
  const { name, location, date, time, description, speaker_id, venue_id, category, image_url } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO EVENT (Name, Location, Date, Time, Description, Speaker_ID, Venue_ID, Category, Image_URL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, location, date, time, description, speaker_id, venue_id, category || 'General', image_url || null]
    );
    res.status(201).json({ message: 'Event created', eventId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE event
router.put('/:id', async (req, res) => {
  const { name, location, date, time, description, category, status } = req.body;
  try {
    await db.query(
      'UPDATE EVENT SET Name=?, Location=?, Date=?, Time=?, Description=?, Category=?, Status=? WHERE Event_ID=?',
      [name, location, date, time, description, category, status, req.params.id]
    );
    res.json({ message: 'Event updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM EVENT WHERE Event_ID = ?', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
