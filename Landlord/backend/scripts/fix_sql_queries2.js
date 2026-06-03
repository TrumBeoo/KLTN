const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'routes', 'bulkUpload.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix line 811
content = content.replace(
  `      'UPDATE UPLOAD_DETAIL SET Status = "success", RoomID = ? WHERE UploadDetailID = ?',\n      [roomId, detail.UploadDetailID]`,
  `      'UPDATE UPLOAD_DETAIL SET Status = ?, RoomID = ? WHERE UploadDetailID = ?',\n      ['success', roomId, detail.UploadDetailID]`
);

// Fix remaining DraftStatus = "published"
content = content.replace(
  /DraftStatus = "published"/g,
  `DraftStatus = ?`
);

// Fix remaining Status = "completed"  
content = content.replace(
  `        'UPDATE UPLOAD_JOB SET Status = "completed", CompletedAt = NOW() WHERE UploadJobID = ?',\n        [req.params.jobId]`,
  `        'UPDATE UPLOAD_JOB SET Status = ?, CompletedAt = NOW() WHERE UploadJobID = ?',\n        ['completed', req.params.jobId]`
);

// Add 'published' param where needed for UPDATE ROOM
const updateRoomPattern = /UPDATE ROOM SET Title = \?, DraftStatus = \?, UpdatedAt = NOW\(\)\s+WHERE RoomID = \?\s+`, \[title, detail\.RoomID\]\);/g;
content = content.replace(updateRoomPattern, `UPDATE ROOM SET Title = ?, DraftStatus = ?, UpdatedAt = NOW()\n            WHERE RoomID = ?\n          \`, ['published', title, detail.RoomID]);`);

const updateRoomPattern2 = /UPDATE ROOM SET Title = \?, DraftStatus = \?, UpdatedAt = NOW\(\)\s+WHERE RoomID = \?\s+`, \[title, room\.RoomID\]\);/g;
content = content.replace(updateRoomPattern2, `UPDATE ROOM SET Title = ?, DraftStatus = ?, UpdatedAt = NOW()\n      WHERE RoomID = ?\n    \`, ['published', title, room.RoomID]);`);

fs.writeFileSync(filePath, content);
console.log('✓ Fixed remaining SQL queries!');
