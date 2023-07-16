import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config()


export const db =  mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: '4walls'
})