// 🎯Purpose : 
    // Create MySQL connection pool
    // Export it
    // Test DB connectivity early
// We will use mysql2/promise (very important).

// 🧠 Why We Use Pool :
    // ✔ Handles multiple requests
    // ✔ Prevents connection exhaustion
    // ✔ Production-ready pattern
// Never use single createConnection() in real projects.


const mysql = require('mysql2/promise');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require('./env');

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: Test DB connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();

module.exports = pool;
