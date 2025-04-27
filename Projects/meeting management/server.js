const express = require('express');
const app = express();
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'sharpener',
    password: 'Sharp@25', // your MySQL password
    database: 'scheduler_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Get available slots
app.get('/slots', (req, res) => {
    db.query('SELECT * FROM slots', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Book a meeting
app.post('/book', (req, res) => {
    const { name, email, time } = req.body;
    db.query('SELECT available FROM slots WHERE time = ?', [time], (err, results) => {
        if (err) throw err;

        if (results.length > 0 && results[0].available > 0) {
            // Insert booking
            db.query('INSERT INTO bookings (name, email, time) VALUES (?, ?, ?)', [name, email, time], (err) => {
                if (err) throw err;

                // Decrease available slot
                db.query('UPDATE slots SET available = available - 1 WHERE time = ?', [time], (err) => {
                    if (err) throw err;
                    res.json({ success: true });
                });
            });
        } else {
            res.json({ success: false, message: 'No slots available' });
        }
    });
});

// Get scheduled meetings
app.get('/bookings', (req, res) => {
    db.query('SELECT bookings.*, slots.meet_link FROM bookings JOIN slots ON bookings.time = slots.time', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Cancel a meeting
app.post('/cancel', (req, res) => {
    const { id, time } = req.body;

    db.query('DELETE FROM bookings WHERE id = ?', [id], (err) => {
        if (err) throw err;

        db.query('UPDATE slots SET available = available + 1 WHERE time = ?', [time], (err) => {
            if (err) throw err;
            res.json({ success: true });
        });
    });
});

// Run server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
