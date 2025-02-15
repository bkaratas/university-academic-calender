const bcrypt = require("bcrypt")
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS calendars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        user_id INTEGER,
        calendar_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (calendar_id) REFERENCES calendars(id)
    )`);

    db.get(`SELECT id FROM users LIMIT 1`, async (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }

        // insert admin and default calendar
        if (!row) {
            try {
                const adminPassword = await bcrypt.hash("admin", 10);
                db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, ['admin', adminPassword]);
                db.run(`INSERT INTO calendars (title) VALUES (?)`, ['Default Calendar']);
            } catch (error) {
                console.error('Error creating initial users:', error);
            }
        }
    });
});

module.exports = db;
