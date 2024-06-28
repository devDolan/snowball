const Pool = require('pg').Pool

const pool = new Pool({
    connectionString: ''
})

module.exports = pool