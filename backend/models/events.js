const db = require("../database");

const Event = {
    create: (title, startDate, endDate, userId, calendarId) => {
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO events (title, start_date, end_date, user_id, calendar_id) VALUES (?, ?, ?, ?, ?)",
                [title, startDate, endDate, userId, calendarId],
                (err) => {
                    if (err) reject(err);
                    resolve(this.lastID);
                },
            );
        });
    },
    getEventById: (eventId) => {
        return new Promise((resolve, reject) => {
            db.get(
                `
                SELECT
                    e.id,
                    e.title,
                    e.start_date,
                    e.end_date,
                    e.user_id,
                    e.calendar_id
                FROM events e
                WHERE e.id = ?;`,
                eventId,
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                },
            );
        });
    },
    findAll: (calendarId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `
                SELECT
                   	e.id,
                   	e.title,
                   	e.start_date,
                   	e.end_date,
                   	e.user_id,
                    e.calendar_id,
                   	u.username
                FROM events e
                JOIN users u ON u.id = e.user_id
                WHERE e.calendar_id = ?;`,
                [calendarId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                },
            );
        });
    },
    update: (id, title, startDate, endDate) => {
        return new Promise((resolve, reject) => {
            db.run(
                "UPDATE events SET title = ?, start_date = ?, end_date = ? WHERE id = ?",
                [title, startDate, endDate, id],
                function (err) {
                    if (err) reject(err);
                    resolve(this.changes);
                },
            );
        });
    },
    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM events WHERE id = ?", id, function (err) {
                if (err) reject(err);
                resolve(this.changes);
            });
        });
    },
};

module.exports = { Event };
