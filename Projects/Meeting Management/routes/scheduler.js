const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

router.get('/slots', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM slots');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/book', async (req, res) => {
    const { name, email, time } = req.body;

    try {
        const [slotResults] = await db.query('SELECT available FROM slots WHERE time = ?', [time]);
        
        if (slotResults.length > 0 && slotResults[0].available > 0) {
            await db.query('INSERT INTO bookings (name, email, time) VALUES (?, ?, ?)', [name, email, time]);
            await db.query('UPDATE slots SET available = available - 1 WHERE time = ?', [time]);
            
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'No slots available' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.get('/bookings', async (req, res) => {
    try {
        const [results] = await db.query(
            'SELECT bookings.*, slots.meet_link FROM bookings JOIN slots ON bookings.time = slots.time'
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.post('/cancel', async (req, res) => {
    const { id, time } = req.body;

    try {
        await db.query('DELETE FROM bookings WHERE id = ?', [id]);
        
        await db.query('UPDATE slots SET available = available + 1 WHERE time = ?', [time]);
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;
