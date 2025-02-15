let config = {};

if (
    !process.env.PORT ||
    !process.env.JWT_SECRET ||
    !process.env.IS_DEVELOPMENT
) {
    console.error(
        "Error: PORT, JWT_SECRET and IS_DEVELOPMENT environment variables are required"
    );
    process.exit(1);
}

if (process.env.IS_DEVELOPMENT == "0") {
    config.IS_DEVELOPMENT = false;
} else {
    config.IS_DEVELOPMENT = true;
}

config.PORT = process.env.PORT;
config.JWT_SECRET = process.env.JWT_SECRET;
config.COOKIE_NAME = "token";
config.ALLOWED_ORIGINS = [
    "http://localhost:5174/",
    "http://localhost:5174",
    "http://localhost:5173/",
    "http://localhost:5173",
];
config.ALLOWED_CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
config.CORS_CREDENTIALS = true

module.exports = config;
