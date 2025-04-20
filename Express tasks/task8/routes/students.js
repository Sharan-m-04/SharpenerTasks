const express = require('express');
const router = express.Router();

const students = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
];

router.get('/', (req, res) => {
  const names = students.map(s => s.name).join(', ');
  res.send(`Students: ${names}`);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const student = students.find(s => s.id === id);

  if (student) {
    res.send(`Student: ${student.name}`);
  } else {
    res.send("Student not found");
  }
});

module.exports = router;
