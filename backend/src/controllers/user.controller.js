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

module.exports = { getAllUsers };
