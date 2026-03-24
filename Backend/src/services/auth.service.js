// 🧠 What This Layer Handles
// login : 
    // Finds user
    // Checks active
    // Compares password
    // Generates JWT

// forgotPassword : 
    // Creates secure reset token
    // Sets expiry
    // Does not leak user existence

// resetPassword :
    // Validates token
    // Hashes new password
    // Clears reset fields

const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const { comparePassword, hashPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/appError');

const login = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.is_active) {
    throw new AppError('Account is deactivated', 403);
  }

  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({
    id: user.id,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    }
  };
};

const forgotPassword = async (email) => {
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await userRepository.findByEmail(email);

  if (!user) {
    return; // Do not reveal whether email exists
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await userRepository.updateResetToken(user.id, resetToken, expiry);

  return resetToken; // Later you’d email this
};

const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new AppError('Token and new password are required', 400);
  }

  const user = await userRepository.findResettableUserByToken(token);

  if (!user) {
    throw new AppError('Invalid or expired token', 400);
  }

  const hashed = await hashPassword(newPassword);

  await userRepository.updatePassword(user.id, hashed);
};


const changePassword = async (userId, oldPassword, newPassword) => {
  if (!oldPassword || !newPassword) {
    throw new AppError('Current and new password are required', 400);
  }

  const currentHash = await userRepository.findPasswordByUserId(userId);
  
  if (!currentHash) throw new AppError('User not found', 404);

  const isMatch = await comparePassword(oldPassword, currentHash);
  if (!isMatch) throw new AppError('Incorrect current password', 400);

  const hashed = await hashPassword(newPassword);
  await userRepository.updatePassword(userId, hashed);
};

const getCurrentUser = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user || !user.is_active) {
    throw new AppError('User not found', 404);
  }

  return user;
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser
};
