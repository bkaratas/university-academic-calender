const config = require("./config");
const jwt = require("jsonwebtoken");
const cors = require("cors")

const setTokenCookie = (res, user) => {
    const token = jwt.sign(
        { id: user.id, username: user.username },
        config.JWT_SECRET,
        { expiresIn: "1w" },
    );

    const secure = process.env.IS_DEVELOPMENT ? false : true;
    const sameSite = process.env.IS_DEVELOPMENT ? "lax" : "strict";

    // Set HTTP-only cookie
    res.cookie(config.COOKIE_NAME, token, {
        httpOnly: true,
        secure: secure,
        sameSite: sameSite,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
    });

    return token;
};

const transformToICSFormat = (eventsArray) => {
  return eventsArray.map(event => {
    const convertDate = (dateStr) => {
      const date = new Date(dateStr);
      return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes()
      ];
    };

    return {
      title: event.title,
      description: event.title,
      start: convertDate(event.start_date),
      end: convertDate(event.end_date)
    };
  });
};

const configureCors = () => {
  return cors({
    origin: function (origin, callback) {
      if (config.ALLOWED_ORIGINS.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: config.CORS_CREDENTIALS,
    methods: config.ALLOWED_CORS_METHODS,
  });
};


module.exports = { setTokenCookie, transformToICSFormat, configureCors };
