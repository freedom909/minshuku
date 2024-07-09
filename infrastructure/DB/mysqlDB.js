import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
let pool;
export const connectToDB = async () => {
    if (!pool) {
      pool = mysql.createPool({
        host: '127.0.0.1',
        user: 'root',
        password: "princess",
        database: 'air',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      console.log('Connected to the mysql database');
    }
  
    return pool;
  };
export default connectToDB;

