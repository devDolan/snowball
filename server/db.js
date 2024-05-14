const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    database: 'snowballdb',
    port: 5432
})

module.exports = pool