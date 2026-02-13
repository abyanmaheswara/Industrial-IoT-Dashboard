const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');
const fs = require('fs');

const setupDatabase = async () => {
  // 1. Connect to default 'postgres' database to create new DB
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres' // Connect to default DB first
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL...');

    // Check if database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
    if (res.rowCount === 0) {
      console.log(`Creating database ${process.env.DB_NAME}...`);
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log('Database created!');
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists.`);
    }
    await client.end();

    // 2. Connect to the new database to create tables
    const dbClient = new Client({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    });

    await dbClient.connect();
    console.log(`Connected to database ${process.env.DB_NAME}...`);

    // Read schema file
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Execute schema
    await dbClient.query(schemaSql);
    console.log('Tables created successfully!');
    
    await dbClient.end();
  } catch (err) {
    console.error('Error setting up database:', err.message);
    if (err.code === '28P01') {
        console.error('>>> PLEASE CHECK YOUR PASSWORD IN .env FILE <<<');
    }
  }
};

setupDatabase();
