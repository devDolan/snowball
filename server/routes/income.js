const express = require('express')
const router = express.Router()
const pool = require('../db')

// Income routes

// Create income item
router.post('/income', async (req, res) => {
    try {
        const {name, amount, date, frequency} = req.body
        const income = await pool.query(
            `INSERT INTO payments (type, name, amount, date, frequency)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            ['income', name, amount, date, frequency])

        res.status(201).json(income.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Get all income items
router.get('/income', async (req, res) => {
    try {
        const income = await pool.query(
            `SELECT * FROM payments
             WHERE type = $1
            `,
            ['income']
        )

        res.status(200).json(income.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Get the total income
router.get('/income/total', async (req, res) => {
    try {
        const total = await pool.query(
            `SELECT SUM(amount) as value
             FROM payments
             WHERE type = $1
            `,
            ['income']
        )

        res.status(200).json(total.rows[0])
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Get a single income item
router.get('/income/:id', async (req, res) => {
    try {
        const {id} = req.params
        const income = await pool.query(
            `SELECT * FROM payments
             WHERE payment_id = $1
            `,
            [id]
        )

        res.status(200).json(income.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Update an income item's amount field
router.put('/income/:id', async (req, res) => {
    try {
        const {id} = req.params
        const {amount} = req.body
        
        const income = await pool.query(
            `UPDATE payments SET amount = $2
             WHERE payment_id = $1 RETURNING *`,
            [id, amount]
        )

        res.status(200).json(income.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Delete an income item
router.delete('/income/:id', async (req, res) => {
    try {
        const {id} = req.params
        const income = await pool.query(
            'DELETE FROM payments WHERE payment_id = $1 RETURNING *', [id]
        )

        res.status(204).json(income.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

module.exports = router