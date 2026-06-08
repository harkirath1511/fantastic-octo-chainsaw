const TaskModel = require('../models/task.model');
const { success, error } = require('../utils/response');
const { bustUserCache } = require('../middleware/cache');

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    const task = await TaskModel.create({
      userId: req.user.id,
      title,
      description,
      status,
      priority,
      dueDate: due_date,
    });
    await bustUserCache(req.user.id);
    return success(res, { task }, 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Server error', 500);
  }
};

const getTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const result = await TaskModel.findAll({
      userId: req.user.id,
      role: req.user.role,
      status,
      priority,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return success(res, {
      tasks: result.tasks,
      pagination: {
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error', 500);
  }
};

const getTask = async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return error(res, 'Task not found', 404);

    if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
      return error(res, 'Forbidden', 403);
    }

    return success(res, { task });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error', 500);
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return error(res, 'Task not found', 404);

    if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
      return error(res, 'Forbidden', 403);
    }

    const { title, description, status, priority, due_date } = req.body;
    const updated = await TaskModel.update(req.params.id, {
      title,
      description,
      status,
      priority,
      dueDate: due_date,
    });

    await bustUserCache(req.user.id);
    return success(res, { task: updated });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error', 500);
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return error(res, 'Task not found', 404);

    if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
      return error(res, 'Forbidden', 403);
    }

    await TaskModel.delete(req.params.id);
    await bustUserCache(req.user.id);
    return success(res, { message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error', 500);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
