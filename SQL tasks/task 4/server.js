const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());

// DB Connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '123456',
  database: 'testDB'
});

// Create User
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  db.query('INSERT INTO Users (name, email) VALUES (?, ?)', [name, email], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ id: result.insertId, name, email });
  });
});

// Get All Users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM Users', (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

// Create Bus
app.post('/buses', (req, res) => {
  const { busNumber, totalSeats, availableSeats } = req.body;
  db.query(
    'INSERT INTO Buses (busNumber, totalSeats, availableSeats) VALUES (?, ?, ?)',
    [busNumber, totalSeats, availableSeats],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ id: result.insertId, busNumber, totalSeats, availableSeats });
    }
  );
});

// Get Available Buses by Seats
app.get('/buses/available/:seats', (req, res) => {
  const seats = parseInt(req.params.seats);
  db.query('SELECT * FROM Buses WHERE availableSeats > ?', [seats], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
