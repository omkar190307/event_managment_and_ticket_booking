const express = require('express');
const router = express.Router();
const db = require('../db');

// GET tickets by event
router.get('/event/:eventId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM TICKET WHERE Event_ID = ?',
      [req.params.eventId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET available tickets (no order)
router.get('/available/:eventId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM TICKET WHERE Event_ID = ? AND Order_ID IS NULL',
      [req.params.eventId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM TICKET WHERE Ticket_ID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE ticket
router.post('/', async (req, res) => {
  const { seat_number, type, price, event_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO TICKET (Seat_Number, Type, Price, Event_ID) VALUES (?, ?, ?, ?)',
      [seat_number, type || 'General', price, event_id]
    );
    res.status(201).json({ message: 'Ticket created', ticketId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
