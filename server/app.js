const express = require('express')
const cors = require('cors')
const paymentsRouter = require('./routes/payments')
const incomeRouter = require('./routes/income')
const expensesRouter = require('./routes/expenses')
const tasksRouter = require('./routes/tasks')

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(paymentsRouter)
app.use(incomeRouter)
app.use(expensesRouter)
app.use(tasksRouter)

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})