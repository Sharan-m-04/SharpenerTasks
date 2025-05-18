const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'USERNAME',
  password: 'PASSWORD',
  database: 'expense_tracker'
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  
  console.log('Connected to MySQL');

  connection.query('CREATE DATABASE IF NOT EXISTS expense_tracker', (err) => {
    if (err) {
      console.error('Error creating database:', err);
      connection.release();
      return;
    }

    connection.query('USE expense_tracker', (err) => {
      if (err) {
        console.error('Error using database:', err);
        connection.release();
        return;
      }

      const createCategoriesTable = `
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          color VARCHAR(20) NOT NULL
        )`;
      
      connection.query(createCategoriesTable, (err) => {
        if (err) {
          console.error('Error creating categories table:', err);
        } else {
          console.log('Categories table created or already exists');
          
          const categories = [
            { name: 'Food', color: '#FF5733' },
            { name: 'Transport', color: '#33A1FF' },
            { name: 'Entertainment', color: '#9333FF' },
            { name: 'Shopping', color: '#FF33E6' },
            { name: 'Bills', color: '#33FF57' },
            { name: 'Salary', color: '#FFDB33' },
            { name: 'Other', color: '#808080' }
          ];
          
          categories.forEach(category => {
            const checkQuery = 'SELECT * FROM categories WHERE name = ?';
            connection.query(checkQuery, [category.name], (err, results) => {
              if (err) {
                console.error(`Error checking for category ${category.name}:`, err);
              } else if (results.length === 0) {
                connection.query('INSERT INTO categories (name, color) VALUES (?, ?)', 
                  [category.name, category.color], 
                  (err) => {
                    if (err) {
                      console.error(`Error inserting category ${category.name}:`, err);
                    } else {
                      console.log(`Category ${category.name} inserted`);
                    }
                  }
                );
              }
            });
          });
        }
      });

      const createTransactionsTable = `
        CREATE TABLE IF NOT EXISTS transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          amount DECIMAL(10, 2) NOT NULL,
          description VARCHAR(100) NOT NULL,
          category_id INT,
          type ENUM('expense', 'income') NOT NULL,
          date DATE NOT NULL,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )`;
      
      connection.query(createTransactionsTable, (err) => {
        if (err) {
          console.error('Error creating transactions table:', err);
        } else {
          console.log('Transactions table created or already exists');
        }
      });

      connection.release();
    });
  });
});

module.exports = pool.promise();
