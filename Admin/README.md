# Admin Dashboard - Rental Housing Platform

Modern Admin Dashboard for managing rental housing platform with AI-powered room matching.

## Design Philosophy

This Admin Dashboard follows modern SaaS design principles inspired by:
- Linear
- Vercel Dashboard
- Stripe Dashboard
- Notion
- Airbnb internal tools

### Key Features

- **Clean & Modern UI**: Minimal design with elegant spacing and soft shadows
- **Platform Management**: Focus on moderation and system management
- **User Management**: Manage tenants, landlords, and admins
- **Listing Moderation**: Approve, reject, or delete property listings
- **Real-time Statistics**: Dashboard with KPI cards and recent activities
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

### Frontend
- React 19
- Material-UI (MUI) 5
- React Router DOM
- Vite

### Backend
- Node.js
- Express
- MySQL2
- CORS

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MySQL database running
- Database `KLTN` created with tables from `/DB/main/`

### Backend Setup

1. Navigate to backend directory:
```bash
cd Admin/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=KLTN

PORT=5050
NODE_ENV=development
```

4. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5050`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd Admin/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5050/api
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get platform statistics
- `GET /api/dashboard/activities` - Get recent activities
- `GET /api/dashboard/pending-listings` - Get pending listings for moderation

### Users
- `GET /api/users` - Get all users with filters
- `GET /api/users/:userId` - Get user details
- `PUT /api/users/:userId/status` - Update user status
- `POST /api/users/:userId/suspend` - Suspend user account
- `POST /api/users/:userId/activate` - Activate user account

### Listings
- `GET /api/listings` - Get all listings with filters
- `GET /api/listings/:listingId` - Get listing details
- `POST /api/listings/:listingId/approve` - Approve listing
- `POST /api/listings/:listingId/reject` - Reject listing
- `DELETE /api/listings/:listingId` - Delete listing

## Features

### Dashboard Overview
- Total Users count
- Total Landlords count
- Active Listings count
- Total Listings count
- Recent activities timeline
- Pending listings moderation queue

### Users Management
- View all users (Tenants, Landlords, Admins)
- Filter by role and status
- Search users by username
- Suspend/Activate user accounts
- View user details

### Listings Management
- View all property listings
- Filter by status and district
- Search listings by title or landlord
- Approve pending listings
- Reject inappropriate listings
- Delete listings
- View listing details

## Design System

### Colors
- Primary: `#0a0e27` (Dark Navy)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Error: `#ef4444` (Red)
- Info: `#3b82f6` (Blue)

### Typography
- Font Family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI
- Modern, clean, and readable

### Components
- Minimal cards with hover elevation
- Smooth transitions and animations
- Glassmorphism effects on navigation
- Modern data tables
- Clean form inputs

## Project Structure

```
Admin/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── dashboard.js
│   │   ├── users.js
│   │   ├── listings.js
│   │   ├── reports.js
│   │   └── settings.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AdminLayout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Listings.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── theme.js
│   ├── .env
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Development

### Running in Development Mode

1. Start backend:
```bash
cd Admin/backend
npm run dev
```

2. Start frontend (in another terminal):
```bash
cd Admin/frontend
npm run dev
```

### Building for Production

Frontend:
```bash
cd Admin/frontend
npm run build
```

Backend:
```bash
cd Admin/backend
npm start
```

## Notes

- This is an Admin Dashboard, NOT a landlord business dashboard
- Focus is on platform management and moderation
- Design follows modern SaaS aesthetics
- Avoid traditional CRUD admin templates
- Prioritize simplicity, clarity, and usability

## Future Enhancements

- Reports management page
- Settings page with feature toggles
- POI management
- Advanced analytics
- Real-time notifications
- Dark mode support
- Export data functionality
