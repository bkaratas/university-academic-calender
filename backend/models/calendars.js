const db = require("../database");

const Calendar = {
    create: (title) => {
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO calendars (title) VALUES (?)",
                title,
                (err) => {
                    if (err) reject(err);
                    resolve(this.lastID);
                },
            );
        });
    },
    getAllCalendars: () => {
        return new Promise((resolve, reject) => {
            db.all(
                "SELECT c.id, c.title FROM calendars c;",
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                },
            );
        });
    },
    getCalendarById: (id) => {
        return new Promise((resolve, reject) => {
            db.get(
                "SELECT c.id, c.title FROM calendars c WHERE c.id = ?",
                id,
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                },
            );
        });
    },
};

module.exports = { Calendar };
