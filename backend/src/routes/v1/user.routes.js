const router = require('express').Router();
const { getAllUsers, makeUserAdmin } = require('../../controllers/user.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { cache, bustUserCache } = require('../../middleware/cache');

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
router.get('/', authenticate, authorize('admin'), cache(60), getAllUsers);

/**
 * @swagger
 * /users/{id}/make-admin:
 *   patch:
 *     summary: Promote a user to admin (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User promoted to admin
 *       404:
 *         description: User not found
 *       409:
 *         description: User is already an admin
 */
router.patch('/:id/make-admin', authenticate, authorize('admin'), async (req, res, next) => {
  await bustUserCache(req.user.id);
  next();
}, makeUserAdmin);

module.exports = router;
