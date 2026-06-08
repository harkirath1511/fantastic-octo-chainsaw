const UserModel = require('../models/user.model');
const { success, error } = require('../utils/response');

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    return success(res, { users });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error', 500);
  }
};

const makeUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) return error(res, 'User not found', 404);
    if (user.role === 'admin') return error(res, 'User is already an admin', 409);

    const updated = await UserModel.updateRole(id);
    return success(res, { user: updated });
  } catch (err) {
    console.error(err);
    return error(res, 'Server error', 500);
  }
};

module.exports = { getAllUsers, makeUserAdmin };
