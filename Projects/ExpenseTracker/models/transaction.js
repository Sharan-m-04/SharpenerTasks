const db = require('./db');

class Transaction {
  static async getByDate(date) {
    try {
      const [rows] = await db.execute(
        'SELECT t.*, c.name as category_name, c.color FROM transactions t ' +
        'LEFT JOIN categories c ON t.category_id = c.id ' +
        'WHERE t.date = ? ORDER BY t.id DESC',
        [date]
      );
      return rows;
    } catch (error) {
      throw new Error('Error fetching transactions: ' + error.message);
    }
  }

  static async getByMonth(year, month) {
    try {
      const [rows] = await db.execute(
        'SELECT t.*, c.name as category_name, c.color FROM transactions t ' +
        'LEFT JOIN categories c ON t.category_id = c.id ' +
        'WHERE YEAR(t.date) = ? AND MONTH(t.date) = ? ORDER BY t.date DESC, t.id DESC',
        [year, month]
      );
      return rows;
    } catch (error) {
      throw new Error('Error fetching monthly transactions: ' + error.message);
    }
  }

  static async getByYear(year) {
    try {
      const [rows] = await db.execute(
        'SELECT t.*, c.name as category_name, c.color FROM transactions t ' +
        'LEFT JOIN categories c ON t.category_id = c.id ' +
        'WHERE YEAR(t.date) = ? ORDER BY t.date DESC, t.id DESC',
        [year]
      );
      return rows;
    } catch (error) {
      throw new Error('Error fetching yearly transactions: ' + error.message);
    }
  }

  static async add(amount, description, categoryId, type, date) {
    try {
      const [result] = await db.execute(
        'INSERT INTO transactions (amount, description, category_id, type, date) VALUES (?, ?, ?, ?, ?)',
        [amount, description, categoryId || null, type, date]
      );
      return result.insertId;
    } catch (error) {
      throw new Error('Error adding transaction: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM transactions WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Error deleting transaction: ' + error.message);
    }
  }

  // Get summary statistics by category for a specific period
  static async getSummaryByCategory(startDate, endDate, type) {
    try {
      const typeFilter = type ? 'AND t.type = ?' : '';
      const params = type 
        ? [startDate, endDate, type] 
        : [startDate, endDate];
      
      const [rows] = await db.execute(
        'SELECT c.id, c.name, c.color, SUM(t.amount) as total ' +
        'FROM transactions t ' +
        'LEFT JOIN categories c ON t.category_id = c.id ' +
        'WHERE t.date BETWEEN ? AND ? ' + typeFilter + ' ' +
        'GROUP BY c.id, c.name, c.color ' +
        'ORDER BY total DESC',
        params
      );
      return rows;
    } catch (error) {
      throw new Error('Error fetching summary: ' + error.message);
    }
  }
}

module.exports = Transaction;
