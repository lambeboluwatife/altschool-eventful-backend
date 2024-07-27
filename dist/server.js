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
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config({ path: "./src/config/config.env" });
(0, db_1.default)();
const app = (0, express_1.default)();
// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "development"
//         ? process.env.DEV_ORIGIN
//         : process.env.PROD_ORIGIN,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
//     allowedHeaders: [
//       "Content-Type",
//       "Origin",
//       "X-Requested-With",
//       "Accept",
//       "x-client-key",
//       "x-client-token",
//       "x-client-secret",
//       "Authorization",
//     ],
//     credentials: true,
//   })
// );
const corsOptions = {
    origin: process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://your-production-domain.com",
    credentials: true,
    methods: "GET,POST,OPTIONS",
    allowedHeaders: "Origin,Content-Type,Accept",
};
app.use(cors(corsOptions));
app.use(express_1.default.json());
// const devOrigin = process.env.DEV_ORIGIN;
// const prodOrigin = process.env.PROD_ORIGIN;
// const allowedOrigins: string[] = [devOrigin!, prodOrigin!];
// const corsOptions: CorsOptions = {
//   origin: (
//     origin: string | undefined,
//     callback: (err: Error | null, allow?: boolean) => void
//   ) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };
// app.use(cors(corsOptions));
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
app.get("/", (req, res) => {
    res.send("hello, welcome to eventful");
});
app.use("/users", users);
app.use("/events", events, attendees);
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
