import mysql from 'mysql2/promise';
import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv';

dotenv.config();

let pool;
let mongodb;

const dbconfig = {
    mysql: async () => {
        if (!pool) {
            pool = mysql.createPool({
                host: '127.0.0.1',
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
            });
            console.log('Connected to the MySQL database');
        }
        return pool;
    },
    mongo: async () => {
        if (!mongodb) {
            const client = await MongoClient.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            mongodb = client.db(process.env.DB_NAME);
            console.log('Connected to MongoDB');
        }
        return mongodb;
    },
};

export default dbconfig;
