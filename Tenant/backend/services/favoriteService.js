const db = require('../config/database');

// Generate FavoriteID
function generateFavoriteId() {
  return 'FAV' + Date.now().toString().slice(-7);
}

// Check if room is favorited
async function checkFavorite(tenantId, roomId) {
  const [rows] = await db.query(
    'SELECT FavoriteID FROM FAVORITE WHERE TenantID = ? AND RoomID = ?',
    [tenantId, roomId]
  );
  return rows.length > 0;
}

// Add to favorites
async function addFavorite(tenantId, roomId) {
  // Check if already exists
  const exists = await checkFavorite(tenantId, roomId);
  if (exists) {
    throw new Error('Phòng đã có trong danh sách yêu thích');
  }
  
  // Get ListingID from room
  const [listings] = await db.query(
    'SELECT ListingID FROM LISTING WHERE RoomID = ? LIMIT 1',
    [roomId]
  );
  const listingId = listings.length > 0 ? listings[0].ListingID : null;
  
  const favoriteId = generateFavoriteId();
  
  await db.query(
    'INSERT INTO FAVORITE (FavoriteID, TenantID, RoomID, ListingID, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
    [favoriteId, tenantId, roomId, listingId]
  );
  
  return { favoriteId };
}

// Remove from favorites
async function removeFavorite(tenantId, roomId) {
  await db.query(
    'DELETE FROM FAVORITE WHERE TenantID = ? AND RoomID = ?',
    [tenantId, roomId]
  );
}

// Get all favorites
async function getFavorites(tenantId) {
  const [rows] = await db.query(
    `SELECT 
      f.FavoriteID,
      f.RoomID,
      f.Rating,
      f.Note,
      f.CreatedAt,
      r.RoomType,
      r.Area,
      r.Price,
      r.Status,
      b.BuildingName,
      b.BuildingAddress,
      b.District,
      (SELECT ImageURL FROM LISTING_IMAGE li 
       JOIN LISTING l ON li.ListingID = l.ListingID 
       WHERE l.RoomID = r.RoomID 
       ORDER BY li.ImageOrder 
       LIMIT 1) as ImageURL
    FROM FAVORITE f
    JOIN ROOM r ON f.RoomID = r.RoomID
    JOIN BUILDING b ON r.BuildingID = b.BuildingID
    WHERE f.TenantID = ?
    ORDER BY f.CreatedAt DESC`,
    [tenantId]
  );
  
  return rows;
}

module.exports = {
  checkFavorite,
  addFavorite,
  removeFavorite,
  getFavorites
};
