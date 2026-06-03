const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'routes', 'bulkUpload.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix patterns
const fixes = [
  // Status queries
  { 
    from: `'SELECT * FROM UPLOAD_DETAIL WHERE UploadJobID = ? AND Status = "pending" ORDER BY RowNumber',\n      [req.params.jobId]`,
    to: `'SELECT * FROM UPLOAD_DETAIL WHERE UploadJobID = ? AND Status = ? ORDER BY RowNumber',\n      [req.params.jobId, 'pending']`
  },
  {
    from: `'UPDATE UPLOAD_JOB SET Status = "processing" WHERE UploadJobID = ?',\n      [req.params.jobId]`,
    to: `'UPDATE UPLOAD_JOB SET Status = ? WHERE UploadJobID = ?',\n      ['processing', req.params.jobId]`
  },
  {
    from: `'UPDATE UPLOAD_DETAIL SET Status = "failed", ErrorMessage = ? WHERE UploadDetailID = ?',\n            ['Thiếu mã phòng', detail.UploadDetailID]`,
    to: `'UPDATE UPLOAD_DETAIL SET Status = ?, ErrorMessage = ? WHERE UploadDetailID = ?',\n            ['failed', 'Thiếu mã phòng', detail.UploadDetailID]`
  },
  {
    from: `'UPDATE UPLOAD_DETAIL SET Status = "success", RoomID = ? WHERE UploadDetailID = ?',\n          [roomId, detail.UploadDetailID]`,
    to: `'UPDATE UPLOAD_DETAIL SET Status = ?, RoomID = ? WHERE UploadDetailID = ?',\n          ['success', roomId, detail.UploadDetailID]`
  },
  {
    from: `'UPDATE UPLOAD_JOB SET Status = "processing", SuccessRows = ?, FailedRows = ? WHERE UploadJobID = ?',\n      [successCount, failedCount, req.params.jobId]`,
    to: `'UPDATE UPLOAD_JOB SET Status = ?, SuccessRows = ?, FailedRows = ? WHERE UploadJobID = ?',\n      ['processing', successCount, failedCount, req.params.jobId]`
  },
  {
    from: `'UPDATE UPLOAD_JOB SET Status = "completed", CompletedAt = NOW() WHERE UploadJobID = ?',\n        [req.params.jobId]`,
    to: `'UPDATE UPLOAD_JOB SET Status = ?, CompletedAt = NOW() WHERE UploadJobID = ?',\n        ['completed', req.params.jobId]`
  },
  {
    from: `'SELECT * FROM UPLOAD_JOB WHERE LandlordID = ? AND Status IN ("pending", "processing") ORDER BY CreatedAt DESC LIMIT 1',\n      [landlords[0].LandlordID]`,
    to: `'SELECT * FROM UPLOAD_JOB WHERE LandlordID = ? AND Status IN (?, ?) ORDER BY CreatedAt DESC LIMIT 1',\n      [landlords[0].LandlordID, 'pending', 'processing']`
  },
  {
    from: `'SELECT * FROM ROOM WHERE RoomID = ? AND LandlordID = ? AND DraftStatus = "draft"',\n      [req.params.roomId, landlordId]`,
    to: `'SELECT * FROM ROOM WHERE RoomID = ? AND LandlordID = ? AND DraftStatus = ?',\n      [req.params.roomId, landlordId, 'draft']`
  },
  {
    from: `'SELECT RoomID FROM ROOM WHERE RoomID = ? AND LandlordID = ? AND DraftStatus = "draft"',\n      [req.params.roomId, landlords[0].LandlordID]`,
    to: `'SELECT RoomID FROM ROOM WHERE RoomID = ? AND LandlordID = ? AND DraftStatus = ?',\n      [req.params.roomId, landlords[0].LandlordID, 'draft']`
  },
  {
    from: `UPDATE ROOM SET Title = ?, DraftStatus = "published", UpdatedAt = NOW()`,
    to: `UPDATE ROOM SET Title = ?, DraftStatus = ?, UpdatedAt = NOW()`
  },
  {
    from: `'UPDATE ROOM SET DraftStatus = "published" WHERE RoomID = ?',\n            [detail.RoomID]`,
    to: `'UPDATE ROOM SET DraftStatus = ? WHERE RoomID = ?',\n            ['published', detail.RoomID]`
  },
  {
    from: `'UPDATE ROOM SET Title = NULL, DraftStatus = "draft", UpdatedAt = NOW() WHERE RoomID = ?',\n      [detail.RoomID]`,
    to: `'UPDATE ROOM SET Title = NULL, DraftStatus = ?, UpdatedAt = NOW() WHERE RoomID = ?',\n      ['draft', detail.RoomID]`
  },
  {
    from: `INSERT INTO UPLOAD_JOB (UploadJobID, LandlordID, BuildingID, Mode, FileName, TotalRows, Status)\n        VALUES (?, ?, ?, 'single_building', ?, ?, 'pending')`,
    to: `INSERT INTO UPLOAD_JOB (UploadJobID, LandlordID, BuildingID, Mode, FileName, TotalRows, Status)\n        VALUES (?, ?, ?, ?, ?, ?, ?)`
  },
  {
    from: `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    to: `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  },
  {
    from: `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'draft', NOW(), NOW())`,
    to: `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`
  }
];

fixes.forEach(fix => {
  content = content.replace(fix.from, fix.to);
});

// Fix parameterized VALUES thêm 'published'
content = content.replace(
  /\], \[title, detail\.RoomID\]\);/g,
  "], ['published', title, detail.RoomID]);"
);

content = content.replace(
  /\[uploadJobId, landlordId, buildingId, req\.file\.originalname, data\.length\]\);/g,
  "[uploadJobId, landlordId, buildingId, 'single_building', req.file.originalname, data.length, 'pending']);"
);

content = content.replace(
  /parsed\.furniture, parsed\.amenities, parsed\.service, parsed\.rules, parsed\.floorType\]\);/g,
  "parsed.furniture, parsed.amenities, parsed.service, parsed.rules, parsed.floorType, 'pending']);"
);

content = content.replace(
  /detail\.FloorType \|\| ''\n    \]\);/g,
  "detail.FloorType || '',\n      'available', 'draft'\n    ]);"
);

fs.writeFileSync(filePath, content);
console.log('✓ Fixed all SQL queries!');
