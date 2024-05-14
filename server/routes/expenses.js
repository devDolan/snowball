const express = require('express')
const router = express.Router()
const pool = require('../db')

// Expenses routes

// Create expense item
router.post('/expenses', async (req, res) => {
    try {
        const {name, amount, date, frequency} = req.body
        const expense = await pool.query(
            `INSERT INTO payments (type, name, amount, date, frequency)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            ['expense', name, amount, date, frequency])

        res.status(201).json(expense.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Get all expense items
router.get('/expenses', async (req, res) => {
    try {
        const expenses = await pool.query(
            `SELECT * FROM payments
             WHERE type = $1
            `,
            ['expense']
        )

        res.status(200).json(expenses.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Get the total expenses
router.get('/expenses/total', async (req, res) => {
    try {
        const total = await pool.query(
            `SELECT SUM(amount) as value
             FROM payments
             WHERE type = $1
            `,
            ['expense']
        )

        res.status(200).json(total.rows[0])
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Get a single expense item
router.get('/expenses/:id', async (req, res) => {
    try {
        const {id} = req.params
        const expense = await pool.query(
            `SELECT * FROM payments
             WHERE payment_id = $1
            `,
            [id]
        )

        res.status(200).json(expense.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Update an expense item's amount field
router.put('/expenses/:id', async (req, res) => {
    try {
        const {id} = req.params
        const {amount} = req.body
        
        const expense = await pool.query(
            `UPDATE payments SET amount = $2
             WHERE payment_id = $1 RETURNING *`,
            [id, amount]
        )

        res.status(200).json(expense.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Delete an expense item
router.delete('/expenses/:id', async (req, res) => {
    try {
        const {id} = req.params
        const expense = await pool.query(
            'DELETE FROM payments WHERE payment_id = $1 RETURNING *', [id]
        )

        res.status(204).json(expense.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

module.exports = router