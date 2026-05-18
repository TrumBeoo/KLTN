const express = require('express')
const { executeQuery } = require('../config/database')

const router = express.Router()

// Get all users with filters
router.get('/', async (req, res) => {
  try {
    const { role, status, search } = req.query
    let query = 'SELECT * FROM ACCOUNT WHERE 1=1'
    const values = []

    if (role && role !== 'all') {
      query += ' AND Role = ?'
      values.push(role)
    }

    if (status && status !== 'all') {
      query += ' AND Status = ?'
      values.push(status)
    }

    if (search) {
      query += ' AND (Username LIKE ? OR AccountID LIKE ?)'
      values.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY CreatedAt DESC LIMIT 100'

    const users = await executeQuery(query, values)

    res.json({
      success: true,
      data: users || []
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    })
  }
})

// Get user details
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const user = await executeQuery('SELECT * FROM ACCOUNT WHERE AccountID = ?', [userId])

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user[0]
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    })
  }
})

// Update user status
router.put('/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params
    const { status } = req.body

    if (!['Active', 'Block'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      })
    }

    await executeQuery(
      'UPDATE ACCOUNT SET Status = ?, UpdatedAt = NOW() WHERE AccountID = ?',
      [status, userId]
    )

    res.json({
      success: true,
      message: `User status updated to ${status}`
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    })
  }
})

// Suspend user account
router.post('/:userId/suspend', async (req, res) => {
  try {
    const { userId } = req.params

    await executeQuery(
      'UPDATE ACCOUNT SET Status = "Block", UpdatedAt = NOW() WHERE AccountID = ?',
      [userId]
    )

    res.json({
      success: true,
      message: 'User account suspended'
    })
  } catch (error) {
    console.error('Error suspending user:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to suspend user',
      error: error.message
    })
  }
})

// Activate user account
router.post('/:userId/activate', async (req, res) => {
  try {
    const { userId } = req.params

    await executeQuery(
      'UPDATE ACCOUNT SET Status = "Active", UpdatedAt = NOW() WHERE AccountID = ?',
      [userId]
    )

    res.json({
      success: true,
      message: 'User account activated'
    })
  } catch (error) {
    console.error('Error activating user:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message
    })
  }
})

module.exports = router
