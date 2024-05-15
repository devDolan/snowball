const express = require('express')
const router = express.Router()
const pool = require('../db')

// Routes

// Create task item
router.post('/tasks', async (req, res) => {
    try {
        const {description, date} = req.body
        const task = await pool.query(
            `INSERT INTO tasks (description, date)
             VALUES ($1, $2)`,
            [description, date])

        res.status(200).send('New task added')
    } catch (err) {
        console.log(err.message)
    }
})

// Get all task items
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await pool.query('SELECT * FROM tasks')
        res.json(tasks.rows).send()
    } catch (err) {
        console.log(err.message)
    }
})

// Get a single task item
router.get('/tasks/:id', async (req, res) => {
    try {
        const {id} = req.params
        const task = await pool.query(
            `SELECT * FROM tasks WHERE id = $1`,
            [id]
        )

        res.status(200).send(task.rows[0])
    } catch (err) {
        console.log(err.message)
    }
})

// Get tasks by date
router.get('/tasks/:date', async (req, res) => {
    try {
        const {date} = req.params
        const expense = await pool.query(
            `SELECT * FROM tasks
             WHERE date = $1
            `,
            [date]
        )

        res.status(200).json(expense.rows)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Update a task item's description field
router.put('/tasks/:id', async (req, res) => {
    try {
        const {id} = req.params
        const {description} = req.body
        
        const updateTask = await pool.query(
            `UPDATE tasks SET description = $2
             WHERE id = $1`,
            [id, description]
        )

        res.status(200).send('Task updated')
    } catch (err) {
        console.log(err.message)
    }
})

// Delete task item
router.delete('/tasks/:id', async (req, res) => {
    try {
        const {id} = req.params
        task = await pool.query(
            'DELETE FROM tasks WHERE id = $1', [id]
        )

        res.status(204).send()
    } catch (err) {
        console.log(err.message)
    }
})

module.exports = router