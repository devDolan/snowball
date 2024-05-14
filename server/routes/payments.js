const express = require('express')
const router = express.Router()
const pool = require('../db')

// Payment routes

// Get balance
router.get('/payments/balance', async (req, res) => {
    try {
        const balance = await pool.query(
            `SELECT
                SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END)
                AS value
             FROM payments;
            `
        )

        res.status(200).json(balance.rows[0])
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Get top 3 upcoming payments
router.get('/payments/upcoming', async (req, res) => {
    try {
        const upcoming = await pool.query(
            `SELECT * FROM payments
             WHERE type = $1
             ORDER BY date ASC
             LIMIT $2
            `,
            ['expense', 3]
        )

        res.status(200).json(upcoming.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Get income and expenses totals
router.get('/payments/totals', async (req, res) => {
    try {
        const totals = await pool.query(
            `SELECT type, SUM(amount) 
             FROM payments
             GROUP BY type
             ORDER BY type DESC
            `
        )

        res.status(200).json(totals.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

module.exports = router