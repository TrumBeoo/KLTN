const express = require('express')
const { executeQuery } = require('../config/database')

const router = express.Router()

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const { status, district, search, limit = 100 } = req.query
    let query = `
      SELECT r.RoomID as id, r.Title as title, r.Price as price, r.Status as status,
             r.DraftStatus, r.CreatedAt, r.UpdatedAt,
             l.Name as landlord, l.LandlordID,
             loc.District as district, loc.Ward as ward
      FROM ROOM r
      JOIN LANDLORD l ON r.LandlordID = l.LandlordID
      LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
      WHERE 1=1
    `
    const values = []

    if (status && status !== 'all') {
      query += ' AND r.Status = ?'
      values.push(status)
    }

    if (district && district !== 'all') {
      query += ' AND loc.District = ?'
      values.push(district)
    }

    if (search) {
      query += ' AND (r.Title LIKE ? OR l.Name LIKE ?)'
      values.push(`%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY r.CreatedAt DESC LIMIT ${parseInt(limit)}`

    const listings = await executeQuery(query, values)
    res.json({ success: true, data: listings || [] })
  } catch (error) {
    console.error('Error fetching listings:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch listings', error: error.message })
  }
})

// Get listing details
router.get('/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params
    const listing = await executeQuery(
      `SELECT r.*, l.Name as landlord, l.Phone, l.Email,
              loc.District, loc.Ward, loc.Street, loc.Address
       FROM ROOM r
       JOIN LANDLORD l ON r.LandlordID = l.LandlordID
       LEFT JOIN LOCATION loc ON r.LocationID = loc.LocationID
       WHERE r.RoomID = ?`,
      [listingId]
    )

    if (!listing || listing.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    res.json({ success: true, data: listing[0] })
  } catch (error) {
    console.error('Error fetching listing:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch listing', error: error.message })
  }
})

// Approve listing
router.post('/:listingId/approve', async (req, res) => {
  try {
    const { listingId } = req.params
    await executeQuery(
      'UPDATE ROOM SET DraftStatus = "published", UpdatedAt = NOW() WHERE RoomID = ?',
      [listingId]
    )
    res.json({ success: true, message: 'Listing approved' })
  } catch (error) {
    console.error('Error approving listing:', error)
    res.status(500).json({ success: false, message: 'Failed to approve listing', error: error.message })
  }
})

// Reject listing
router.post('/:listingId/reject', async (req, res) => {
  try {
    const { listingId } = req.params
    await executeQuery(
      'UPDATE ROOM SET DraftStatus = "draft", Status = "maintenance", UpdatedAt = NOW() WHERE RoomID = ?',
      [listingId]
    )
    res.json({ success: true, message: 'Listing rejected' })
  } catch (error) {
    console.error('Error rejecting listing:', error)
    res.status(500).json({ success: false, message: 'Failed to reject listing', error: error.message })
  }
})

// Delete listing
router.delete('/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params
    await executeQuery('DELETE FROM ROOM WHERE RoomID = ?', [listingId])
    res.json({ success: true, message: 'Listing deleted' })
  } catch (error) {
    console.error('Error deleting listing:', error)
    res.status(500).json({ success: false, message: 'Failed to delete listing', error: error.message })
  }
})

module.exports = router
