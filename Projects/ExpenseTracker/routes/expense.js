const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const db = require('../models/db');

router.get('/date/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const transactions = await Transaction.getByDate(date);
    res.json(transactions || []);
  } catch (error) {
    console.error('Error in /date/:date route:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

router.get('/month/:year/:month', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    const transactions = await Transaction.getByMonth(year, month);
    res.json(transactions || []);
  } catch (error) {
    console.error('Error in /month/:year/:month route:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

router.get('/year/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const transactions = await Transaction.getByYear(year);
    res.json(transactions || []);
  } catch (error) {
    console.error('Error in /year/:year route:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

router.get('/between', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const [rows] = await db.execute(
      'SELECT t.*, c.name as category_name, c.color FROM transactions t ' +
      'LEFT JOIN categories c ON t.category_id = c.id ' +
      'WHERE t.date BETWEEN ? AND ? ORDER BY t.date DESC, t.id DESC',
      [startDate, endDate]
    );
    
    res.json(rows || []);
  } catch (error) {
    console.error('Error in /between route:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

router.post('/', async (req, res) => {
  try {
    const { amount, description, category_id, type, date } = req.body;
    
    if (!amount || !description || !type || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (type !== 'expense' && type !== 'income') {
      return res.status(400).json({ error: 'Type must be either expense or income' });
    }
    
    const id = await Transaction.add(
      parseFloat(amount), 
      description,
      category_id ? parseInt(category_id) : null,
      type, 
      date
    );
    
    res.status(201).json({ id, message: 'Transaction added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await Transaction.delete(id);
    
    if (success) {
      res.json({ message: 'Transaction deleted successfully' });
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
