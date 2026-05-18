const express = require('express')
const { executeQuery } = require('../config/database')

const router = express.Router()

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await executeQuery('SELECT COUNT(*) as count FROM ACCOUNT WHERE Role = "Tenant"')
    const totalLandlords = await executeQuery('SELECT COUNT(*) as count FROM ACCOUNT WHERE Role = "Landlord"')
    const activeListings = await executeQuery('SELECT COUNT(*) as count FROM ROOM WHERE Status = "available" AND DraftStatus = "published"')
    const totalListings = await executeQuery('SELECT COUNT(*) as count FROM ROOM')

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers[0]?.count || 0,
        totalLandlords: totalLandlords[0]?.count || 0,
        activeListings: activeListings[0]?.count || 0,
        totalListings: totalListings[0]?.count || 0
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message })
  }
})

// Get recent activities
router.get('/activities', async (req, res) => {
  try {
    const landlords = await executeQuery(`
      SELECT 'landlord_signup' as type, 'New Landlord Registered' as title,
             Name as description, CreatedAt as timestamp, 'pending' as status
      FROM LANDLORD ORDER BY CreatedAt DESC LIMIT 3
    `)

    const rooms = await executeQuery(`
      SELECT 'listing_submitted' as type, 'New Listing Submitted' as title,
             Title as description, CreatedAt as timestamp, 'pending' as status
      FROM ROOM WHERE DraftStatus = 'draft' ORDER BY CreatedAt DESC LIMIT 3
    `)

    const activities = [...(landlords || []), ...(rooms || [])]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)

    res.json({ success: true, data: activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch activities', error: error.message })
  }
})

// Get pending listings for moderation
router.get('/pending-listings', async (req, res) => {
  try {
    const listings = await executeQuery(`
      SELECT r.RoomID as id, r.Title as title, l.Name as landlord,
             loc.District as district, r.Price as price, r.CreatedAt as submittedAt,
             r.Status as status
      FROM ROOM r
      JOIN LANDLORD l ON r.LandlordID = l.LandlordID
      LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
      WHERE r.DraftStatus = 'draft'
      ORDER BY r.CreatedAt DESC
      LIMIT 10
    `)

    res.json({ success: true, data: listings || [] })
  } catch (error) {
    console.error('Error fetching pending listings:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch pending listings', error: error.message })
  }
})

module.exports = router
