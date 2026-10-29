const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '../data/test_ellas_kitchen.db');
const db = new DatabaseSync(dbPath);

console.log('Database opened at:', dbPath);

const fs = require('fs');
const schema = fs.readFileSync(path.join(__dirname, '../src/lib/db/schema.sql'), 'utf8');
db.exec(schema);

console.log('Schema executed successfully.');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;").all();
console.log('Tables created:', tables.map(t => t.name));

// Clean test db
db.close();
fs.unlinkSync(dbPath);
console.log('Test completed and cleaned up.');
