const {Pool} = require('pg');

const getDBPool = (concurrencyCount = 1) => {
    return new Pool({
        concurrencyCount: concurrencyCount,
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: 5432,
    })
}

module.exports = {
    getDBPool
}