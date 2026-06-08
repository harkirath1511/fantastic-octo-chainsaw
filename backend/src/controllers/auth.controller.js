const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const { sign } = require('../utils/jwt');
const { success, error } = require('../utils/response');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await UserModel.findByEmail(email);
    if (existing) return error(res, 'Email already in use', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, passwordHash });

    const token = sign({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, COOKIE_OPTS);

    return success(res, { user }, 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Server error', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) return error(res, 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return error(res, 'Invalid credentials', 401);

    const token = sign({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, COOKIE_OPTS);

    const { password_hash, ...safeUser } = user;
    return success(res, { user: safeUser });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error', 500);
  }
};

const me = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return error(res, 'User not found', 404);
    return success(res, { user });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error', 500);
  }
};

const logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  return success(res, { message: 'Logged out' });
};

module.exports = { register, login, me, logout };
