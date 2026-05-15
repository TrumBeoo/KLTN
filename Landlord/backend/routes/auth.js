const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('../config/passport');
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

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed&error_title=X%C3%A1c%20th%E1%BB%B1c%20Google%20th%E1%BA%A5t%20b%E1%BA%A1i` 
  }),
  async (req, res) => {
    try {
      // Check if user exists
      if (!req.user) {
        console.error('No user in request after Google auth');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&error_title=L%E1%BB%97i%20x%C3%A1c%20th%E1%BB%B1c`);
      }

      // Only allow Landlord role
      if (req.user.Role !== 'Landlord') {
        console.log(`Invalid role: ${req.user.Role}, expected Landlord`);
        const errorTitle = encodeURIComponent('Sai loại tài khoản');
        const errorMsg = encodeURIComponent(
          `Tài khoản Google của bạn đã được đăng ký với vai trò "${req.user.Role === 'Tenant' ? 'Người thuê' : req.user.Role}". ` +
          'Vui lòng sử dụng ứng dụng dành cho Người thuê hoặc đăng ký tài khoản mới cho Chủ nhà.'
        );
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorMsg}&error_title=${errorTitle}`);
      }

      const token = userService.generateToken(req.user);
      console.log('Google auth successful, redirecting with token');
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      const errorTitle = encodeURIComponent('Lỗi xác thực');
      const errorMsg = encodeURIComponent('Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.');
      res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorMsg}&error_title=${errorTitle}`);
    }
  }
);

module.exports = router;
