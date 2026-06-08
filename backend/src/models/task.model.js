const pool = require('../config/db');

const TaskModel = {
  async create({ userId, title, description, status, priority, dueDate }) {
    const { rows } = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, description || null, status || 'pending', priority || 'medium', dueDate || null]
    );
    return rows[0];
  },

  async findAll({ userId, role, status, priority, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (role !== 'admin') {
      conditions.push(`t.user_id = $${idx++}`);
      params.push(userId);
    }
    if (status) {
      conditions.push(`t.status = $${idx++}`);
      params.push(status);
    }
    if (priority) {
      conditions.push(`t.priority = $${idx++}`);
      params.push(priority);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT t.*, u.name AS owner_name, u.email AS owner_email
       FROM tasks t
       JOIN users u ON t.user_id = u.id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tasks t ${where}`,
      params
    );

    return { tasks: rows, total: parseInt(countResult.rows[0].count) };
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT t.*, u.name AS owner_name, u.email AS owner_email
       FROM tasks t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async update(id, { title, description, status, priority, dueDate }) {
    const { rows } = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date)
       WHERE id = $6
       RETURNING *`,
      [title, description, status, priority, dueDate || null, id]
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = TaskModel;
