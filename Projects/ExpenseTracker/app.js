const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const expenseRoutes = require('./routes/expense');
const categoryRoutes = require('./routes/category');
const reportRoutes = require('./routes/report');
const db = require('./models/db');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
