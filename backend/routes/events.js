const express = require("express");
const router = express.Router();
const { Event } = require("../models/events");
const { Calendar } = require("../models/calendars");
const verifyToken = require("../middleware/auth");
const config = require("../config");

// OK
router.get("/:calendarId", async (req, res) => {
    const { calendarId } = req.params;
    if (!calendarId) return res.sendStatus(400);
    const calendar = await Calendar.getCalendarById(calendarId);

    if (!calendar) return res.sendStatus(404);
    const events = await Event.findAll(calendar.id);

    res.json(events);
});

// OK
router.get("/detail/:eventId", async (req, res) => {
    const { eventId } = req.params;
    if (!eventId) return res.sendStatus(400);

    const event = await Event.getEventById(eventId);
    if (!event) return res.sendStatus(404);

    res.json(event);
});

// OK
// check what happens when thre inputs are empty
router.post("/", verifyToken, async (req, res) => {
    const user = req.user;
    if (!user.id) return res.sendStatus(500);
    
    const { title, startDate, endDate, calendarId } = req.body;
    if (!title || !startDate || !endDate || !calendarId)
        return res.sendStatus(400);

    // check if calendar exists
    const calendar = await Calendar.getCalendarById(calendarId);
    if (!calendar) return res.sendStatus(404);

    await Event.create(title, startDate, endDate, user.id, calendar.id);
    res.sendStatus(201);
});

// OK
router.put("/", verifyToken, async (req, res) => {
    const { title, startDate, endDate, eventId } = req.body;
    if (!title || !startDate || !endDate || !eventId)
        return res.sendStatus(400);

    // get event data
    const event = await Event.getEventById(eventId);

    // if there is no such en event return 404
    if (!event) return res.sendStatus(404);

    // user is admin or owner of the event
    await Event.update(event.id, title, startDate, endDate);
    res.sendStatus(204);
});

// OK
router.delete("/:eventId", verifyToken, async (req, res) => {
    const { eventId } = req.params;
    if (!eventId) return res.sendStatus(400);

    // get event data
    const event = await Event.getEventById(eventId);

    // if there is no such en event return 404
    if (!event) return res.sendStatus(404);

    await Event.delete(event.id);
    res.sendStatus(204);
});

module.exports = router;
