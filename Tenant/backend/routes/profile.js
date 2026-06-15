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
        t.TenantID, t.Name, t.Phone, t.Email, t.Gender, t.Birthday,
        YEAR(CURDATE()) - YEAR(t.Birthday) as Age,
        a.Username, a.AvatarURL, a.Status, a.CreatedAt,
        tp.BudgetMin, tp.BudgetMax,
        CONCAT(COALESCE(tp.BudgetMin, 0), ' - ', COALESCE(tp.BudgetMax, 0)) as Budget,
        tp.PreferredAmenities as Preference
      FROM TENANT t
      JOIN ACCOUNT a ON t.AccountID = a.AccountID
      LEFT JOIN TENANT_PREFERENCE tp ON t.TenantID = tp.TenantID
      WHERE t.AccountID = ?
    `, [req.user.accountId]);

    if (tenants.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người thuê' });
    }

    // Lấy lifestyle (habits)
    const [lifestyles] = await db.query(`
      SELECT lm.LifestyleID, lm.Name, lm.Category, lm.Icon
      FROM TENANT_LIFESTYLE tl
      JOIN LIFESTYLE_MASTER lm ON tl.LifestyleID = lm.LifestyleID
      WHERE tl.TenantID = ?
    `, [tenants[0].TenantID]);

    tenants[0].Lifestyles = lifestyles;
    tenants[0].Habit = lifestyles.map(l => l.Name).join(', ');

    res.json({ success: true, data: tenants[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Update tenant profile
router.put('/profile', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { name, age, phone, email, gender, birthday, university, job, bio } = req.body;

    // Cập nhật thông tin cơ bản trong TENANT
    await connection.query(`
      UPDATE TENANT 
      SET Name = ?, Phone = ?, Email = ?, Gender = ?, Birthday = ?, University = ?, Job = ?, Bio = ?
      WHERE AccountID = ?
    `, [name, phone, email, gender, birthday, university, job, bio, req.user.accountId]);

    await connection.commit();
    res.json({ success: true, message: 'Cập nhật thông tin thành công' });
  } catch (error) {
    await connection.rollback();
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
  } finally {
    connection.release();
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

// Get all lifestyles
router.get('/lifestyles', async (req, res) => {
  try {
    const [lifestyles] = await db.query(
      'SELECT LifestyleID, Name, Category, Icon FROM LIFESTYLE_MASTER ORDER BY Category, Name'
    );
    res.json({ success: true, data: lifestyles });
  } catch (error) {
    console.error('Get lifestyles error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Get roommate profile
router.get('/roommate-profile', authMiddleware, async (req, res) => {
  try {
    const [tenants] = await db.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [req.user.accountId]);
    if (tenants.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người thuê' });
    }

    const tenantId = tenants[0].TenantID;

    // Get basic info from TENANT
    const [profile] = await db.query(`
      SELECT 
        t.Name, t.Gender, t.Birthday,
        YEAR(CURDATE()) - YEAR(t.Birthday) as Age,
        t.University, t.Job, t.Bio,
        t.BudgetMin, t.BudgetMax, t.PreferredDistrict
      FROM TENANT t
      WHERE t.TenantID = ?
    `, [tenantId]);

    if (profile.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ' });
    }

    // Get preferences
    const [preferences] = await db.query(`
      SELECT 
        BudgetMin, BudgetMax, PreferredDistrict,
        PreferredAmenities, PreferredRoomType,
        MoveInDate, PreferredGender
      FROM TENANT_PREFERENCE
      WHERE TenantID = ?
    `, [tenantId]);

    // Get lifestyles
    const [lifestyles] = await db.query(`
      SELECT lm.LifestyleID, lm.Name, lm.Category, lm.Icon, tl.ValueLevel
      FROM TENANT_LIFESTYLE tl
      JOIN LIFESTYLE_MASTER lm ON tl.LifestyleID = lm.LifestyleID
      WHERE tl.TenantID = ?
    `, [tenantId]);

    // Get interests
    const [interests] = await db.query(`
      SELECT im.InterestID, im.Name, im.Icon
      FROM TENANT_INTEREST ti
      JOIN INTEREST_MASTER im ON ti.InterestID = im.InterestID
      WHERE ti.TenantID = ?
    `, [tenantId]);

    const roommateProfile = {
      ...profile[0],
      preferences: preferences[0] || {},
      lifestyles: lifestyles.map(l => l.Name),
      interests: interests.map(i => i.Name)
    };

    res.json({ success: true, profile: roommateProfile });
  } catch (error) {
    console.error('Get roommate profile error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Save/Update roommate profile
router.post('/roommate-profile', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [tenants] = await connection.query('SELECT TenantID FROM TENANT WHERE AccountID = ?', [req.user.accountId]);
    if (tenants.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người thuê' });
    }

    const tenantId = tenants[0].TenantID;
    const {
      name, age, gender, occupation, university, bio,
      lifestyle, interests, sleepTime, wakeTime, cleanLevel, noiseLevel,
      budget, locations, genderPreference, duration
    } = req.body;

    // Calculate birthday from age
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - (age || 25);
    const birthday = `${birthYear}-01-01`;

    // Map gender values: 'Nam' -> 'male', 'Nữ' -> 'female', 'any' -> 'other'
    const genderMap = {
      'Nam': 'male',
      'Nữ': 'female',
      'any': 'other',
      'male': 'male',
      'female': 'female',
      'other': 'other'
    };
    const mappedGender = genderMap[gender] || 'other';

    // Map gender preference: 'Nam' -> 'male', 'Nữ' -> 'female', 'any' -> 'any'
    const genderPrefMap = {
      'Nam': 'male',
      'Nữ': 'female',
      'any': 'any',
      'male': 'male',
      'female': 'female'
    };
    const mappedGenderPref = genderPrefMap[genderPreference] || 'any';

    // Update TENANT basic info
    await connection.query(`
      UPDATE TENANT 
      SET Name = ?, Gender = ?, Birthday = ?, University = ?, Job = ?, Bio = ?,
          BudgetMin = ?, BudgetMax = ?, PreferredDistrict = ?
      WHERE TenantID = ?
    `, [name, mappedGender, birthday, university || '', occupation || '', bio || '', budget[0], budget[1], locations.join(', '), tenantId]);

    // Insert or update TENANT_PREFERENCE
    const [existingPref] = await connection.query(
      'SELECT 1 FROM TENANT_PREFERENCE WHERE TenantID = ?',
      [tenantId]
    );

    if (existingPref.length > 0) {
      await connection.query(`
        UPDATE TENANT_PREFERENCE
        SET BudgetMin = ?, BudgetMax = ?, PreferredDistrict = ?,
            PreferredGender = ?, PreferredAmenities = ?
        WHERE TenantID = ?
      `, [budget[0], budget[1], locations.join(', '), mappedGenderPref, duration || '', tenantId]);
    } else {
      await connection.query(`
        INSERT INTO TENANT_PREFERENCE (TenantID, BudgetMin, BudgetMax, PreferredDistrict, PreferredGender, PreferredAmenities)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [tenantId, budget[0], budget[1], locations.join(', '), mappedGenderPref, duration || '']);
    }

    // Delete old lifestyles and insert new ones
    await connection.query('DELETE FROM TENANT_LIFESTYLE WHERE TenantID = ?', [tenantId]);
    
    if (lifestyle && lifestyle.length > 0) {
      // Get or create lifestyle master records
      for (const ls of lifestyle) {
        // Check if lifestyle exists in master
        const [existingLifestyle] = await connection.query(
          'SELECT LifestyleID FROM LIFESTYLE_MASTER WHERE Name = ?',
          [ls]
        );

        let lifestyleId;
        if (existingLifestyle.length > 0) {
          lifestyleId = existingLifestyle[0].LifestyleID;
        } else {
          // Create new lifestyle
          const [maxId] = await connection.query('SELECT MAX(CAST(SUBSTRING(LifestyleID, 4) AS UNSIGNED)) as maxNum FROM LIFESTYLE_MASTER');
          const nextNum = (maxId[0].maxNum || 0) + 1;
          lifestyleId = `LFS${String(nextNum).padStart(7, '0')}`;
          
          await connection.query(
            'INSERT INTO LIFESTYLE_MASTER (LifestyleID, Name, Category) VALUES (?, ?, ?)',
            [lifestyleId, ls, 'general']
          );
        }

        // Insert into TENANT_LIFESTYLE
        await connection.query(
          'INSERT INTO TENANT_LIFESTYLE (TenantID, LifestyleID, ValueLevel) VALUES (?, ?, ?)',
          [tenantId, lifestyleId, 1]
        );
      }
    }

    // Delete old interests and insert new ones
    await connection.query('DELETE FROM TENANT_INTEREST WHERE TenantID = ?', [tenantId]);
    
    if (interests && interests.length > 0) {
      for (const interest of interests) {
        // Check if interest exists in master
        const [existingInterest] = await connection.query(
          'SELECT InterestID FROM INTEREST_MASTER WHERE Name = ?',
          [interest]
        );

        let interestId;
        if (existingInterest.length > 0) {
          interestId = existingInterest[0].InterestID;
        } else {
          // Create new interest
          const [maxId] = await connection.query('SELECT MAX(CAST(SUBSTRING(InterestID, 4) AS UNSIGNED)) as maxNum FROM INTEREST_MASTER');
          const nextNum = (maxId[0].maxNum || 0) + 1;
          interestId = `INT${String(nextNum).padStart(7, '0')}`;
          
          await connection.query(
            'INSERT INTO INTEREST_MASTER (InterestID, Name) VALUES (?, ?)',
            [interestId, interest]
          );
        }

        // Insert into TENANT_INTEREST
        await connection.query(
          'INSERT INTO TENANT_INTEREST (TenantID, InterestID) VALUES (?, ?)',
          [tenantId, interestId]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Lưu hồ sơ tìm roommate thành công' });
  } catch (error) {
    await connection.rollback();
    console.error('Save roommate profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
  } finally {
    connection.release();
  }
});

module.exports = router;
