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
             VALUES ($1, $2) RETURNING *`,
            [description, date])

        res.status(201).json(task.rows[0])
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Get all task items
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await pool.query('SELECT * FROM tasks')
        res.status(200).json(tasks.rows)
    } catch (err) {
        console.log(err.message)
    }
})

// Get a single task item
router.get('/tasks/:id', async (req, res) => {
    try {
        const {id} = req.params
        const task = await pool.query(
            `SELECT * FROM tasks WHERE task_id = $1`,
            [id]
        )

        res.status(200).send(task.rows[0])
    } catch (err) {
        console.log(err.message)
    }
})

// Get tasks by date
router.get('/tasks/date/:date', async (req, res) => {
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
             WHERE task_id = $1`,
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
        const task = await pool.query(
            `DELETE FROM tasks WHERE task_id = $1
             RETURNING *`
            , [id]
        )

        res.status(204).json(task.rows[0])
    } catch (err) {
        console.log(err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

module.exports = router