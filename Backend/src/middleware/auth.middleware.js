const { verifyToken } = require('../utils/jwt');
const userRepository = require('../repositories/user.repository');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token);
    const user = await userRepository.findById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User session is no longer valid' });
    }

    req.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      is_active: user.is_active
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
