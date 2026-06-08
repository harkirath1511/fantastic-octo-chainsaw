const router = require('express').Router();
const { getAllUsers } = require('../../controllers/user.controller');
const { authenticate, authorize } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Admin-only user management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, authorize('admin'), getAllUsers);

module.exports = router;
