const express = require("express");
const router = express.Router();
const { Calendar } = require("../models/calendars");
const { Event } = require("../models/events");
const verifyToken = require("../middleware/auth");
const ics = require('ics')
const utils = require("../utils")


router.get("/", async (_req, res) => {
    const calendars = await Calendar.getAllCalendars();

    res.json(calendars);
});


router.post("/", verifyToken, async (req, res) => {
    const { title } = req.body;
    if (!title) return res.sendStatus(400);
    
    await Calendar.create(title);
    res.sendStatus(201);
});



router.get("/ics/:calendarId", async (req, res) => {
    const { calendarId } = req.params;
    if (!calendarId) return res.sendStatus(400);

    const events = await Event.findAll(calendarId);
    if (!events?.length) return res.sendStatus(404);


    const icsData = utils.transformToICSFormat(events);

    ics.createEvents(icsData, (error, value) => {
        if (error) {
            console.log(error);
            return res.sendStatus(500);
        }

        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', 'attachment; filename="calendar-export.ics"');

        res.send(value);
    });
});

module.exports = router;
