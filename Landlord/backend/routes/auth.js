const express = require('express');
const router = express.Router();
const multer = require('multer');
const userService = require('../services/userService');
const authMiddleware = require('../middleware/auth');
const {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhone,
  validateName
} = require('../utils/validation');

const upload = multer({ storage: multer.memoryStorage() });

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

    // Only allow Landlord role
    if (user.Role !== 'Landlord' && user.Role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ chủ nhà mới có thể đăng nhập ở trang này. Vui lòng sử dụng đúng trang đăng nhập cho role của bạn.'
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
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
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
      'Landlord'
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      account_id: accountId
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
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
    const profile = await userService.getUserProfile(req.user.accountId);
    
    res.json({
      success: true,
      user: {
        account_id: req.user.accountId,
        username: req.user.username,
        role: req.user.role,
        profile
      }
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await userService.getUserProfile(req.user.accountId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ'
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, address, city, district, ward } = req.body;

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

    const result = await userService.updateUserProfile(
      req.user.accountId,
      name,
      email,
      phone,
      address || null,
      city || null,
      district || null,
      ward || null
    );

    if (result) {
      res.json({
        success: true,
        message: 'Cập nhật hồ sơ thành công'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Cập nhật hồ sơ thất bại'
      });
    }
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
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
    console.error('Change password error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Upload avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ảnh'
      });
    }

    const result = await userService.uploadAvatar(req.user.accountId, req.file.buffer);

    res.json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      avatarURL: result.avatarURL
    });
  } catch (error) {
    console.error('Upload avatar error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Delete avatar
router.delete('/avatar', authMiddleware, async (req, res) => {
  try {
    await userService.deleteAvatar(req.user.accountId);

    res.json({
      success: true,
      message: 'Xóa ảnh đại diện thành công'
    });
  } catch (error) {
    console.error('Delete avatar error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

module.exports = router;
