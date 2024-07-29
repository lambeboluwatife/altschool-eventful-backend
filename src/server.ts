import dotenv from "dotenv";
import express, { Application, Request, Response, NextFunction } from "express";
import "colors";
import morgan from "morgan";
import passport from "./config/passport";
import session from "express-session";
const cors = require("cors");
import "./cronJobs";

import connectDB from "./config/db";

dotenv.config({ path: "./src/config/config.env" });

connectDB();

const app: Application = express();
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
  origin:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://your-production-domain.com",
  credentials: true,
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "Origin,Content-Type,Accept",
};

app.use(cors(corsOptions));

app.use(express.json());

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
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

const users = require("./routes/users");
const events = require("./routes/events");
const attendees = require("./routes/attendees");

app.get("/", (req: Request, res: Response) => {
  res.send("hello, welcome to eventful");
});

app.use("/users", users);
app.use("/events", events, attendees);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.all("*", (req: Request, res: Response) => {
  res.status(404).send("404 - route not found");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});
