const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token không tồn tại'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kiểm tra role - chỉ cho phép Landlord và Admin
    if (decoded.role !== 'Landlord' && decoded.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập. Vui lòng sử dụng tài khoản chủ nhà.'
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

module.exports = authMiddleware;
