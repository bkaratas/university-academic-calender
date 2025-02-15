const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const config = require("../config");
const utils = require("../utils");
const verifyToken = require("../middleware/auth");


router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.sendStatus(400);
    
    const user = await User.findByUsername(username);
    if (!user) return res.sendStatus(404);

    const givenPasswordHash = await bcrypt.compare(password, user.password);
    if (!user || !givenPasswordHash) {
        return res.sendStatus(403);
    }

    utils.setTokenCookie(res, user, user.role);
    res.sendStatus(200);
});


router.get("/whoami", verifyToken, async (req, res) => {
    const user = req.user;
    
    res.json(user);
});


router.post("/logout", (req, res) => {
    res.clearCookie(config.COOKIE_NAME);
    res.sendStatus(200);
});

module.exports = router;
