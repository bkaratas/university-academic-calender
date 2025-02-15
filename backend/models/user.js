const db = require("../database");

const User = {
    findByUsername: (username) => {
        return new Promise((resolve, reject) => {
            db.get(
                "SELECT u.id, u.username, u.password FROM users u WHERE username = ?",
                [username],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                },
            );
        });
    },
    findById: (userId) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT u.id, u.username FROM users u WHERE u.id = ?", [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },
};

module.exports = { User };
