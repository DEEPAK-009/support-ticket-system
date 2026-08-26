const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authMiddleware, authController.changePassword);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/admin/verify', authController.verifyAdminPassword);
router.post('/admin/create-user', authController.adminCreateUser);
router.get('/departments', authController.getDepartments);

module.exports = router;
