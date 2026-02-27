import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ silent: true });

const CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 3000,
  QUERY_TIMEOUT: 30000
};

const parseDatabaseUrl = (url) => {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1)
  };
};

const getDatabaseConfig = () => {
  let dbConfig;

  if (process.env.DATABASE_URL) {
    dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
  } else {
    const required = ['DB_HOST', 'DB_USERNAME', 'DB_DATABASE'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error('Database configuration incomplete');
    }
    dbConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD ,
      database: process.env.DB_DATABASE
    };
  }

  return {
    ...dbConfig,
    connectionLimit: 10,
    waitForConnections: true,
    connectTimeout: 30000,
    timezone: '+00:00',
    charset: 'utf8mb4',
    dateStrings: ['DATE', 'DATETIME']
  };
};

let pool = mysql.createPool(getDatabaseConfig());

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const testConnection = async (attempt = 1) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query('SELECT 1');
    return true;
  } catch (error) {
    if (attempt < CONFIG.MAX_RETRY_ATTEMPTS) {
      await sleep(CONFIG.RETRY_DELAY);
      return testConnection(attempt + 1);
    }
    return false;
  } finally {
    if (connection) connection.release();
  }
};

export const query = async (sql, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows, fields] = await Promise.race([
      connection.execute(sql, params),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), CONFIG.QUERY_TIMEOUT)
      )
    ]);
    return [rows, fields];
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const getConnection = async () => {
  return await pool.getConnection();
};

export const transaction = async (callback) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const closePool = async () => {
  try {
    await pool.end();
  } catch (error) {
    throw error;
  }
};

export const initializeDatabase = async () => {
  try {
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to establish database connection');
    }

    const gracefulShutdown = async () => {
      try {
        await closePool();
        process.exit(0);
      } catch (error) {
        process.exit(1);
      }
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    return true;
  } catch (error) {
    return false;
  }
};

export default pool;