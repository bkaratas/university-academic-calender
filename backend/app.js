const express = require('express');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const calendarRoutes = require('./routes/calendars');
const cookieParser = require('cookie-parser');
const config = require('./config');
const utils = require('./utils')

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(utils.configureCors());
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/calendars', calendarRoutes);

app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});