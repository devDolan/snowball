const Pool = require('pg').Pool

const pool = new Pool({
    connectionString: 'postgres://snowballdb_user:I4y3k5c0VpoVQqfgKdzt5U00Cw37beeh@dpg-cp1c9ugl6cac738olj90-a.singapore-postgres.render.com/snowballdb?ssl=true'
})

module.exports = pool