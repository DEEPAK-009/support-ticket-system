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
const { generateToken, verifyToken } = require('../utils/jwt');
const { ADMIN_PASSWORD } = require('../config/env');
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

const verifyAdminPassword = async (adminPassword) => {
  if (!adminPassword) {
    throw new AppError('Admin password is required', 400);
  }

  if (adminPassword !== ADMIN_PASSWORD) {
    throw new AppError('Invalid admin password', 401);
  }

  const adminToken = generateToken({
    role: 'admin_creation',
    purpose: 'create_user'
  });

  return {
    message: 'Admin authentication successful',
    adminToken
  };
};

const adminCreateUser = async ({
  email,
  password,
  full_name,
  role = 'user',
  department_id = null,
  level = null,
  employee_id = null,
  adminToken,
  adminPassword
}) => {
  // Validate admin authorization
  let isAuthorized = false;

  if (adminPassword && adminPassword === ADMIN_PASSWORD) {
    isAuthorized = true;
  } else if (adminToken) {
    try {
      const decoded = verifyToken(adminToken);
      if (decoded && (decoded.role === 'admin_creation' || decoded.role === 'admin')) {
        isAuthorized = true;
      }
    } catch (err) {
      throw new AppError('Invalid or expired admin session. Please re-authenticate.', 401);
    }
  }

  if (!isAuthorized) {
    throw new AppError('Admin authentication required', 401);
  }

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  const allowedRoles = ['user', 'agent', 'admin'];
  const userRole = allowedRoles.includes(role) ? role : 'user';

  if (role && !allowedRoles.includes(role)) {
    throw new AppError('Invalid role specified', 400);
  }

  const allowedLevels = ['junior', 'mid', 'senior'];
  if (level && !allowedLevels.includes(level)) {
    throw new AppError('Invalid level specified', 400);
  }

  const existingUser = await userRepository.findByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  const password_hash = await hashPassword(password);
  const newUser = await userRepository.createUser({
    email: normalizedEmail,
    password_hash,
    full_name: full_name ? full_name.trim() : null,
    role: userRole,
    department_id: department_id ? parseInt(department_id) : null,
    level: level || null,
    employee_id: employee_id ? employee_id.trim() : null,
    is_active: 1
  });

  return {
    message: 'User created successfully',
    user: {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      department_id: newUser.department_id,
      level: newUser.level,
      employee_id: newUser.employee_id,
      is_active: newUser.is_active
    }
  };
};

const getDepartments = async () => {
  return await userRepository.getAllDepartments();
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  verifyAdminPassword,
  adminCreateUser,
  getDepartments
};
