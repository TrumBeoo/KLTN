const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const authMiddleware = require('../middleware/auth');
const {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhone,
  validateName
} = require('../utils/validation');

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const user = await userService.loginUser(username, password);

    if (user.error) {
      return res.status(401).json({
        success: false,
        message: user.error
      });
    }

    // Only allow Tenant role
    if (user.Role !== 'Tenant') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người thuê mới có thể đăng nhập ở trang này. Vui lòng sử dụng đúng trang đăng nhập cho role của bạn.'
      });
    }

    const token = userService.generateToken(user);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        account_id: user.AccountID,
        username: user.Username,
        name: user.Name,
        email: user.Email,
        phone: user.Phone,
        role: user.Role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;

    if (!validateUsername(username)) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập không hợp lệ'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    if (!validateName(name)) {
      return res.status(400).json({
        success: false,
        message: 'Tên không hợp lệ'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ'
      });
    }

    const usernameExists = await userService.checkUsernameExists(username);
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      });
    }

    const emailExists = await userService.checkEmailExists(email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    const accountId = await userService.registerUser(
      username,
      password,
      name,
      email,
      phone,
      'Tenant'
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      account_id: accountId
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Đăng xuất thành công'
  });
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    const result = await userService.updatePassword(req.user.accountId, newPassword);

    if (result) {
      res.json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Đổi mật khẩu thất bại'
      });
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router;
