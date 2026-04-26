const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const cloudinaryService = require('../services/cloudinaryService');

const upload = multer({ storage: multer.memoryStorage() });

// Get tenant profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [tenants] = await db.query(`
      SELECT 
        t.TenantID, t.Name, t.Age, t.Budget, t.Habit, t.Preference,
        t.Phone, t.Email,
        a.Username, a.AvatarURL, a.Status, a.CreatedAt
      FROM TENANT t
      JOIN ACCOUNT a ON t.AccountID = a.AccountID
      WHERE t.AccountID = ?
    `, [req.user.accountId]);

    if (tenants.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người thuê' });
    }

    res.json({ success: true, data: tenants[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Update tenant profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, age, phone, email, budget, habit, preference } = req.body;

    await db.query(`
      UPDATE TENANT 
      SET Name = ?, Age = ?, Phone = ?, Email = ?, Budget = ?, Habit = ?, Preference = ?
      WHERE AccountID = ?
    `, [name, age, phone, email, budget, habit, preference, req.user.accountId]);

    res.json({ success: true, message: 'Cập nhật thông tin thành công' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Get rental history
router.get('/rental-history', authMiddleware, async (req, res) => {
  try {
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [req.user.accountId]);
    if (tenants.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const [contracts] = await db.query(`
      SELECT 
        c.ContractID, c.StartDate, c.EndDate, c.Status, c.TotalPrice, c.Deposit,
        r.RoomCode, r.RoomType, r.Price, r.Area,
        l.District, l.Ward, l.Address,
        (SELECT ImageURL FROM ROOM_IMAGE WHERE RoomID = r.RoomID AND IsPrimary = 1 LIMIT 1) as ImageURL
      FROM CONTRACT c
      JOIN ROOM r ON c.RoomID = r.RoomID
      JOIN LOCATION l ON r.LocationID = l.LocationID
      WHERE c.TenantID = ?
      ORDER BY c.StartDate DESC
    `, [tenants[0].TenantID]);

    res.json({ success: true, data: contracts });
  } catch (error) {
    console.error('Get rental history error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Get viewing schedules
router.get('/viewing-schedules', authMiddleware, async (req, res) => {
  try {
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [req.user.accountId]);
    if (tenants.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const [schedules] = await db.query(`
      SELECT 
        vs.ScheduleID, vs.DateTime, vs.Status,
        r.RoomID, r.RoomCode, r.RoomType, r.Price, r.Area,
        l.District, l.Ward, l.Address,
        (SELECT ImageURL FROM ROOM_IMAGE WHERE RoomID = r.RoomID AND IsPrimary = 1 LIMIT 1) as ImageURL
      FROM VIEWING_SCHEDULE vs
      JOIN ROOM r ON vs.RoomID = r.RoomID
      JOIN LOCATION l ON r.LocationID = l.LocationID
      WHERE vs.TenantID = ?
      ORDER BY vs.DateTime DESC
    `, [tenants[0].TenantID]);

    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('Get viewing schedules error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Upload avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh' });
    }

    const result = await cloudinaryService.uploadImage(req.file.buffer, 'avatars');

    await db.query(`
      UPDATE ACCOUNT 
      SET AvatarURL = ?, AvatarPublicID = ?
      WHERE AccountID = ?
    `, [result.url, result.public_id, req.user.accountId]);

    res.json({ success: true, message: 'Cập nhật ảnh đại diện thành công', avatarURL: result.url });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Get favorite rooms
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [req.user.accountId]);
    if (tenants.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const [favorites] = await db.query(`
      SELECT 
        F.FavoriteID,
        F.CreatedAt as FavoritedAt,
        F.Rating,
        F.Note,
        R.RoomID,
        R.RoomCode,
        R.RoomType,
        R.Price,
        R.Area,
        R.MaxPeople,
        R.Status,
        R.Description as RoomDescription,
        L.District,
        L.Ward,
        L.Street,
        L.Address,
        (SELECT ImageURL FROM ROOM_IMAGE WHERE RoomID = R.RoomID AND IsPrimary = 1 LIMIT 1) as ImageURL,
        LST.Title as ListingTitle,
        LL.Name as LandlordName,
        LL.Phone as LandlordPhone
      FROM FAVORITE F
      INNER JOIN ROOM R ON F.RoomID = R.RoomID
      INNER JOIN LOCATION L ON R.LocationID = L.LocationID
      LEFT JOIN LISTING LST ON F.ListingID = LST.ListingID
      LEFT JOIN LANDLORD LL ON R.LandlordID = LL.LandlordID
      WHERE F.TenantID = ?
      ORDER BY F.Rating DESC, F.CreatedAt DESC
    `, [tenants[0].TenantID]);

    res.json({ success: true, data: favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Add room to favorites
router.post('/favorites', authMiddleware, async (req, res) => {
  try {
    const { roomId, listingId, rating, note } = req.body;
    
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [req.user.accountId]);
    if (tenants.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người thuê' });
    }

    const [existing] = await db.query(
      'SELECT 1 FROM FAVORITE WHERE TenantID = ? AND RoomID = ?',
      [tenants[0].TenantID, roomId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Phòng này đã có trong danh sách yêu thích' });
    }

    const [maxId] = await db.query('SELECT MAX(CAST(SUBSTRING(FavoriteID, 4) AS UNSIGNED)) as maxNum FROM FAVORITE');
    const nextNum = (maxId[0].maxNum || 0) + 1;
    const favoriteId = `FAV${String(nextNum).padStart(7, '0')}`;

    await db.query(
      'INSERT INTO FAVORITE (FavoriteID, TenantID, RoomID, ListingID, Rating, Note) VALUES (?, ?, ?, ?, ?, ?)',
      [favoriteId, tenants[0].TenantID, roomId, listingId || null, rating || null, note || null]
    );

    res.json({ success: true, message: 'Đã thêm vào danh sách yêu thích' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Remove room from favorites
router.delete('/favorites/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [req.user.accountId]);
    if (tenants.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người thuê' });
    }

    await db.query(
      'DELETE FROM FAVORITE WHERE TenantID = ? AND RoomID = ?',
      [tenants[0].TenantID, roomId]
    );

    res.json({ success: true, message: 'Đã xóa khỏi danh sách yêu thích' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Check if room is favorite
router.get('/favorites/check/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [req.user.accountId]);
    if (tenants.length === 0) {
      return res.json({ success: true, isFavorite: false });
    }

    const [result] = await db.query(
      'SELECT 1 FROM FAVORITE WHERE TenantID = ? AND RoomID = ?',
      [tenants[0].TenantID, roomId]
    );

    res.json({ success: true, isFavorite: result.length > 0 });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Update favorite rating
router.put('/favorites/:roomId/rating', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { rating, note } = req.body;
    
    if (rating && (rating < 0 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Đánh giá phải từ 0 đến 5 sao' });
    }

    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [req.user.accountId]);
    if (tenants.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người thuê' });
    }

    const [result] = await db.query(
      'UPDATE FAVORITE SET Rating = ?, Note = ? WHERE TenantID = ? AND RoomID = ?',
      [rating || null, note || null, tenants[0].TenantID, roomId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng trong danh sách yêu thích' });
    }

    res.json({ success: true, message: 'Cập nhật đánh giá thành công' });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
