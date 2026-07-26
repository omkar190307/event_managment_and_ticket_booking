const express = require('express');
const router = express.Router();
const db = require('../db');

// GET payment by order
router.get('/order/:orderId', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM PAYMENT WHERE Order_ID = ?', [req.params.orderId]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE payment
router.post('/', async (req, res) => {
  const { order_id, payment_method } = req.body;
  if (!order_id || !payment_method)
    return res.status(400).json({ error: 'order_id and payment_method required' });

  try {
    const transaction_id = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
    const [result] = await db.query(
      'INSERT INTO PAYMENT (Transaction_ID, Payment_Method, Status, Order_ID) VALUES (?, ?, ?, ?)',
      [transaction_id, payment_method, 'success', order_id]
    );
    // Update order status
    await db.query('UPDATE `ORDER` SET Status = ? WHERE Order_ID = ?', ['confirmed', order_id]);
    res.status(201).json({
      message: 'Payment successful',
      paymentId: result.insertId,
      transaction_id,
      status: 'success'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all payments (admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, o.Total_Price, u.Name AS User_Name
      FROM PAYMENT p
      JOIN \`ORDER\` o ON p.Order_ID = o.Order_ID
      JOIN USER u ON o.User_ID = u.User_ID
      ORDER BY p.Payment_Date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
