"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
require("colors");
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("./config/passport"));
const express_session_1 = __importDefault(require("express-session"));
const cors = require("cors");
require("./cronJobs");
const db_1 = __importDefault(require("./config/db"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
dotenv_1.default.config({ path: "./src/config/config.env" });
(0, db_1.default)();
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:3000",
    "https://eventful-frontend.vercel.app",
];
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: "GET,POST,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
};
// const corsOptions = {
//   origin:
//     process.env.NODE_ENV === "development"
//       ? "http://localhost:3000"
//       : "https://eventful-frontend.vercel.app/",
//   credentials: true,
//   methods: "GET,POST,OPTIONS",
//   allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
// };
app.use(cors(corsOptions));
app.use(express_1.default.json());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many requests, please try again later.",
        });
    },
});
app.use(limiter);
// Express Session
app.use((0, express_session_1.default)({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
}));
// Passport Middleware
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
const users = require("./routes/users");
const events = require("./routes/events");
const attendees = require("./routes/attendees");
const tickets = require("./routes/tickets");
const organizers = require("./routes/organizers");
const analytics = require("./routes/analytics");
const authRoutes = require("./routes/authRoute");
app.get("/", (req, res) => {
    res.send("hello, welcome to eventful");
});
app.use("/api/auth", users);
app.use("/api/events", events);
app.use("/api/attendee", attendees);
app.use("/api/organizer/created", organizers);
app.use("/api/tickets", tickets);
app.use("/api/analytics", analytics);
app.use("/api/auth", authRoutes);
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
app.all("*", (req, res) => {
    res.status(404).send("404 - route not found");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});
