/**
 * Lider Elektrik - Karar Destek Sistemi (KDS)
 * Database Connection Module
 * 
 * This module handles the MySQL database connection using mysql2/promise.
 * Connection credentials are loaded from environment variables.
 * 
 * Tables in lider_elektrik_kds database:
 * - kategoriler: Product categories
 * - urunler: Products (including volume in db units)
 * - stoklar: Stock per location
 * - satislar: Sales history
 * - lokasyonlar: Store and depots (with address, coordinates, capacity, rent)
 * - kds_analiz_log: Log of DSS analysis results
 */

const mysql = require('mysql2/promise');

// Database configuration from environment variables
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lider_elektrik_kds',
    
    // Connection pool settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    
    // Enable support for multiple statements if needed
    multipleStatements: false,
    
    // Timezone configuration
    timezone: '+03:00' // Turkey timezone
};

// Create a connection pool (will be initialized when needed)
let pool = null;

/**
 * Get the database connection pool
 * Creates the pool if it doesn't exist yet
 * @returns {mysql.Pool} MySQL connection pool
 */
function getPool() {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
        console.log('✅ MySQL bağlantı havuzu oluşturuldu');
    }
    return pool;
}

/**
 * Execute a SQL query with parameters
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function query(sql, params = []) {
    const pool = getPool();
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    }
}

/**
 * Test the database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
    try {
        const pool = getPool();
        const connection = await pool.getConnection();
        console.log('✅ MySQL bağlantısı başarılı');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL bağlantı hatası:', error.message);
        return false;
    }
}

/**
 * Close all connections in the pool
 */
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('MySQL bağlantı havuzu kapatıldı');
    }
}

// Export functions and pool
module.exports = {
    getPool,
    query,
    testConnection,
    closePool
};



















