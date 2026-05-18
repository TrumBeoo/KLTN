const express = require('express')
const { executeQuery } = require('../config/database')

const router = express.Router()

// Get all reports with filters
router.get('/', async (req, res) => {
  try {
    const { type, status, search } = req.query
    let query = `
      SELECT r.*, a.Username as reporter_name
      FROM REPORT r
      JOIN ACCOUNT a ON r.ReporterID = a.AccountID
      WHERE 1=1
    `
    const values = []

    if (type && type !== 'all') {
      query += ' AND r.Type = ?'
      values.push(type)
    }

    if (status && status !== 'all') {
      query += ' AND r.Status = ?'
      values.push(status)
    }

    if (search) {
      query += ' AND (r.Subject LIKE ? OR a.Username LIKE ?)'
      values.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY r.CreatedAt DESC LIMIT 100'

    const reports = await executeQuery(query, values)

    res.json({
      success: true,
      data: reports
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    })
  }
})

// Get report details
router.get('/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params
    const report = await executeQuery(
      `SELECT r.*, a.Username as reporter_name, a2.Username as reported_name
       FROM REPORT r
       JOIN ACCOUNT a ON r.ReporterID = a.AccountID
       LEFT JOIN ACCOUNT a2 ON r.ReportedID = a2.AccountID
       WHERE r.ReportID = ?`,
      [reportId]
    )

    if (report.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      })
    }

    res.json({
      success: true,
      data: report[0]
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    })
  }
})

// Update report status
router.put('/:reportId/status', async (req, res) => {
  try {
    const { reportId } = req.params
    const { status } = req.body

    const validStatuses = ['Pending', 'Investigating', 'Resolved', 'Rejected']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      })
    }

    await executeQuery(
      'UPDATE REPORT SET Status = ?, UpdatedAt = NOW() WHERE ReportID = ?',
      [status, reportId]
    )

    res.json({
      success: true,
      message: `Report status updated to ${status}`
    })
  } catch (error) {
    console.error('Error updating report status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: error.message
    })
  }
})

// Resolve report
router.post('/:reportId/resolve', async (req, res) => {
  try {
    const { reportId } = req.params
    const { action } = req.body

    await executeQuery(
      'UPDATE REPORT SET Status = "Resolved", UpdatedAt = NOW() WHERE ReportID = ?',
      [reportId]
    )

    res.json({
      success: true,
      message: 'Report resolved',
      action: action || 'no action taken'
    })
  } catch (error) {
    console.error('Error resolving report:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to resolve report',
      error: error.message
    })
  }
})

module.exports = router
