const { body, query } = require('express-validator');

const createTaskRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'done']).withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('due_date').optional().isISO8601().withMessage('Invalid date format'),
];

const updateTaskRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'done']).withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('due_date').optional().isISO8601().withMessage('Invalid date format'),
];

const listTaskRules = [
  query('status').optional().isIn(['pending', 'in_progress', 'done']),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = { createTaskRules, updateTaskRules, listTaskRules };
