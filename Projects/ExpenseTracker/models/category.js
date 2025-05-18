const db = require('./db');

class Category {
  static async getAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM categories ORDER BY name');
      return rows;
    } catch (error) {
      throw new Error('Error fetching categories: ' + error.message);
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw new Error('Error fetching category: ' + error.message);
    }
  }

  static async add(name, color) {
    try {
      const [result] = await db.execute(
        'INSERT INTO categories (name, color) VALUES (?, ?)',
        [name, color]
      );
      return result.insertId;
    } catch (error) {
      throw new Error('Error adding category: ' + error.message);
    }
  }
}

module.exports = Category;
