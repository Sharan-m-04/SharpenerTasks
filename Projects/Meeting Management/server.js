const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const schedulerRoutes = require('./routes/scheduler');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', schedulerRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
