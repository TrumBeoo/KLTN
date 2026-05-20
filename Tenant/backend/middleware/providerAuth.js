const jwt = require('jsonwebtoken');

const providerAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token không tồn tại'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kiểm tra role - chỉ cho phép Provider
    if (decoded.role !== 'Provider') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập. Vui lòng sử dụng tài khoản nhà cung cấp dịch vụ.'
      });
    }
    
    // Map accountId -> userId để tương thích với code hiện tại
    req.user = {
      ...decoded,
      userId: decoded.accountId
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

module.exports = providerAuthMiddleware;
