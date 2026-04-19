# Bulk Room Upload Implementation Analysis

## Overview
The Landlord frontend has a comprehensive bulk upload system for creating multiple rooms from an Excel file with support for images and publishing.

---

## Frontend Files

### 1. **[ExcelUploadWithImages.jsx](Landlord/frontend/src/components/ExcelUploadWithImages.jsx)** (Main Component)
The primary component handling bulk room creation workflow with 4 steps:
1. Upload Excel file
2. Preview data
3. Upload images & Publish
4. Completion

#### Key State Variables:
- `activeStep` - Current step in workflow (0-3)
- `file` - Selected Excel file
- `uploadJobId` - Server-generated job ID
- `roomsData` - Array of room objects with publish status
- `draftBatches` - List of draft batches to resume
- `preview` - Preview of Excel data before creation

#### API Endpoints Called:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/bulk/draft-batches` | GET | Load previous draft batches |
| `/api/bulk/batch/{jobId}` | GET | Load batch details and resume work |
| `/api/listings/preview-excel` | POST | Preview Excel data before creation |
| `/api/bulk/bulk-create/{uploadJobId}` | POST | Create rooms from Excel data |
| `/api/rooms/{roomId}/images` | POST | Upload images for a room |
| `/api/bulk/bulk-publish/{uploadJobId}` | POST | Publish all rooms in batch |
| `/api/bulk/publish-single/{uploadJobId}/{detailId}` | POST | Publish individual room |
| `/api/bulk/job/{jobId}` | DELETE | Delete/complete a batch job |

#### Key Functions:

```javascript
// Load draft batches for resuming work
const loadDraftBatches = async () => {
  const response = await fetch(`${API_URL}/bulk/draft-batches`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  setDraftBatches(data.data || [])
}

// Preview Excel file
const handleFileSelect = async (e) => {
  const formData = new FormData()
  formData.append('file', selectedFile)
  
  const response = await fetch(`${API_URL}/listings/preview-excel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  })
  const data = await response.json()
  setUploadJobId(data.data.uploadJobId)
  setPreview(data.data.preview)
}

// Create rooms from Excel
const handleCreateRooms = async () => {
  const response = await fetch(`${API_URL}/bulk/bulk-create/${uploadJobId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  const roomsPreview = data.data.rooms.map(r => ({
    roomId: r.roomId,
    roomCode: r.roomCode,
    imageCount: 0,
    published: false
  }))
  setRoomsData(roomsPreview)
}

// Upload images for room
const handleImageUpload = async (roomId, files) => {
  const formData = new FormData()
  Array.from(files).forEach(file => {
    formData.append('images', file)
  })
  
  const response = await fetch(`${API_URL}/rooms/${roomId}/images`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  })
  const data = await response.json()
  if (data.success) {
    // Update image count
    setRoomsData(prev => prev.map(r => 
      r.roomId === roomId 
        ? { ...r, imageCount: (r.imageCount || 0) + files.length } 
        : r
    ))
  }
}

// Publish all rooms
const handlePublish = async () => {
  const response = await fetch(`${API_URL}/bulk/bulk-publish/${uploadJobId}`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  const data = await response.json()
  if (data.success) {
    setRoomsData(prev => prev.map(r => ({ ...r, published: true })))
  }
}

// Publish single room
const handlePublishSingle = async (room) => {
  const response = await fetch(
    `${API_URL}/bulk/publish-single/${uploadJobId}/${room.detailId}`,
    {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  )
  const data = await response.json()
  if (data.success) {
    setRoomsData(prev => prev.map(r => 
      r.detailId === room.detailId ? { ...r, published: true } : r
    ))
  }
}
```

#### Workflow Steps:

**Step 0 - Upload Excel:**
- User selects `.xlsx` or `.xls` file
- File is sent to preview endpoint
- Returns upload job ID and preview data
- Validates required `room_code` column

**Step 1 - Preview Data:**
- Displays table with all rooms from Excel
- Shows validation errors if any
- User confirms to proceed with room creation
- Calls `bulk-create` endpoint

**Step 2 - Upload Images & Publish:**
- Shows all created rooms in grid cards
- Each room can have images uploaded individually
- Progress shows: X/Total rooms published
- User can publish all at once or per-room
- Cards become semi-transparent after publishing

**Step 3 - Completion:**
- Success message
- Option to create new batch

#### Draft Batch Management:
- Displays incomplete batches on initial load
- Shows: File name, total rooms, published count, rooms with images
- Can resume or delete incomplete batches

---

### 2. **[ExcelUpload.jsx](Landlord/frontend/src/components/ExcelUpload.jsx)** (Legacy Component)
Simpler bulk upload without image support.

#### API Endpoints:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/listings/preview-excel` | POST | Preview Excel data |
| `/api/listings/upload-excel` | POST | Upload and create rooms directly |

#### Key Functions:
```javascript
const handleFileSelect = async (e) => {
  const formData = new FormData()
  formData.append('file', selectedFile)
  
  const response = await fetch(`${API_URL}/listings/preview-excel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  })
  const data = await response.json()
  setPreview(data.data)
}

const handleUpload = async () => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${API_URL}/listings/upload-excel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  })
  const data = await response.json()
  if (data.success) {
    showSuccess('Thành công!', `Đã tạo ${data.data.successCount} tin đăng`)
  }
}
```

---

### 3. **[ManageListings.jsx](Landlord/frontend/src/pages/ManageListings.jsx)** (Page Container)
Page that integrates the `ExcelUploadWithImages` component.

Usage:
```jsx
import ExcelUploadWithImages from '../components/ExcelUploadWithImages'

// In render:
<ExcelUploadWithImages />
```

---

## Backend Implementation

### **[bulkUpload.js](Landlord/backend/routes/bulkUpload.js)** (Route Handler)

#### Database Schema Involved:
- `UPLOAD_JOB` - Stores upload jobs
- `UPLOAD_DETAIL` - Stores individual room details from Excel
- `ROOM` - Created rooms
- `ROOM_IMAGE` - Room images
- `LISTING` - Published listings

#### Key Endpoints:

```javascript
// GET /api/bulk/draft-batches
// Retrieves all pending/processing batches for landlord
// Returns: Array of jobs with room counts, published counts, image counts

// GET /api/bulk/batch/:jobId
// Retrieves specific batch details with all rooms
// Returns: Job info + rooms array with details

// POST /api/bulk/bulk-create/:uploadJobId
// Creates actual Room records from UPLOAD_DETAIL entries
// Returns: Array of created rooms with roomId, roomCode

// POST /api/bulk/bulk-publish/:uploadJobId
// Publishes all rooms in batch as listings
// Returns: Success count

// POST /api/bulk/publish-single/:uploadJobId/:detailId
// Publishes individual room
// Returns: Success status

// DELETE /api/bulk/job/:jobId
// Deletes/completes the batch job
// Cleans up draft data
```

---

## Excel Format Requirements

**Required Column:**
- `room_code` - Room identifier (unique)

**Optional Columns:**
- `title` - Room title
- `price` - Price per month
- `area` - Room area (m²)
- `max_people` - Maximum occupants
- `district` - District name
- `ward` - Ward name
- `address` - Full address
- `room_type` - Type of room
- `floor_type` - Floor type
- `service` - Services
- `rules` - House rules
- `description` - Room description
- `furniture` - Furniture list
- `amenities` - Amenities

---

## API Configuration

**Base URL:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555/api'
```

**Authentication:**
- All requests include: `Authorization: Bearer ${token}`
- Token retrieved from: `localStorage.getItem('token')`

---

## State Flow Diagram

```
Start
  ↓
Load Draft Batches
  ├→ Display saved batches (can resume)
  └→ Or start new upload
  ↓
Select Excel File
  ↓
Preview Excel Data (/api/listings/preview-excel)
  ├→ Validate required columns
  └→ Show preview table
  ↓
Create Rooms (/api/bulk/bulk-create/:jobId)
  ├→ Save rooms to database
  └→ Show grid of created rooms
  ↓
Upload Images (optional, per room)
  │ (/api/rooms/:roomId/images)
  ↓
Publish Rooms (all or individual)
  ├→ Bulk: /api/bulk/bulk-publish/:jobId
  └→ Individual: /api/bulk/publish-single/:jobId/:detailId
  ↓
Complete (/api/bulk/job/:jobId - DELETE)
  ↓
Success
```

---

## Error Handling

- File validation (Excel format only)
- Missing required columns
- Preview errors shown in red rows
- API errors display notification modal
- Each step can be cancelled to restart

