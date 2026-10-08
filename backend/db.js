const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl:
        process.env.DB_SSL === "true"
            ? { rejectUnauthorized: false }
            : false,

    max: 10,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 10000
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error);
});

async function query(text, params) {
    return pool.query(text, params);
}

async function checkDatabase() {
    const result = await pool.query(
        "SELECT NOW() AS now"
    );

    return result.rows[0];
}

module.exports = {
    pool,
    query,
    checkDatabase
};