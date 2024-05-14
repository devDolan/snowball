const Pool = require('pg').Pool

const pool = new Pool({
    user: 'snowballdb_user',
    password: 'I4y3k5c0VpoVQqfgKdzt5U00Cw37beeh',
    host: 'postgres://snowballdb_user:I4y3k5c0VpoVQqfgKdzt5U00Cw37beeh@dpg-cp1c9ugl6cac738olj90-a.singapore-postgres.render.com/snowballdb?ssl=true',
    database: 'snowballdb',
    port: 5432
})

module.exports = pool