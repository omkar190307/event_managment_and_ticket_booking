const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all orders for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        o.Order_ID, o.Date, o.Total_Price, o.Status, o.User_ID,
        COUNT(t.Ticket_ID)                                      AS Ticket_Count,
        GROUP_CONCAT(t.Type ORDER BY t.Ticket_ID SEPARATOR ', ') AS Ticket_Types,
        GROUP_CONCAT(t.Seat_Number ORDER BY t.Ticket_ID SEPARATOR ', ') AS Seat_Numbers,
        MAX(e.Name)       AS Event_Name,
        MAX(e.Date)       AS Event_Date,
        MAX(e.Location)   AS Event_Location,
        MAX(e.Category)   AS Event_Category,
        MAX(e.Image_URL)  AS Event_Image
      FROM \`ORDER\` o
      LEFT JOIN TICKET t ON t.Order_ID = o.Order_ID
      LEFT JOIN EVENT e  ON t.Event_ID  = e.Event_ID
      WHERE o.User_ID = ?
      GROUP BY o.Order_ID, o.Date, o.Total_Price, o.Status, o.User_ID
      ORDER BY o.Date DESC
    `, [req.params.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM `ORDER` WHERE Order_ID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const [tickets] = await db.query(
      'SELECT t.*, e.Name AS Event_Name FROM TICKET t JOIN EVENT e ON t.Event_ID = e.Event_ID WHERE t.Order_ID = ?',
      [req.params.id]
    );
    res.json({ ...rows[0], tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE order + assign tickets
router.post('/', async (req, res) => {
  const { user_id, ticket_ids } = req.body;
  if (!user_id || !ticket_ids || ticket_ids.length === 0)
    return res.status(400).json({ error: 'user_id and ticket_ids required' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Calculate total price
    const [ticketRows] = await conn.query(
      `SELECT * FROM TICKET WHERE Ticket_ID IN (${ticket_ids.map(() => '?').join(',')}) AND Order_ID IS NULL`,
      ticket_ids
    );
    if (ticketRows.length !== ticket_ids.length)
      throw new Error('Some tickets are already booked');

    const total = ticketRows.reduce((sum, t) => sum + parseFloat(t.Price), 0);

    // Create order
    const [orderResult] = await conn.query(
      'INSERT INTO `ORDER` (Total_Price, User_ID, Status) VALUES (?, ?, ?)',
      [total, user_id, 'confirmed']
    );
    const orderId = orderResult.insertId;

    // Assign tickets to order
    await conn.query(
      `UPDATE TICKET SET Order_ID = ? WHERE Ticket_ID IN (${ticket_ids.map(() => '?').join(',')})`,
      [orderId, ...ticket_ids]
    );

    await conn.commit();
    res.status(201).json({ message: 'Order created', orderId, total });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// GET all orders (admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, u.Name AS User_Name, u.Email
      FROM \`ORDER\` o JOIN USER u ON o.User_ID = u.User_ID
      ORDER BY o.Date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
