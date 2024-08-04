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

const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://altschool-eventful-backend.onrender.com",
  credentials: true,
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "Origin,Content-Type,Accept",
};

app.use(cors(corsOptions));

app.use(express.json());

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
const tickets = require("./routes/tickets");
const organizers = require("./routes/organizers");
const analytics = require("./routes/analytics");

app.get("/", (req: Request, res: Response) => {
  res.send("hello, welcome to eventful");
});

app.use("/api/auth", users);
app.use("/api/events", events);
app.use("/api/attendee", attendees);
app.use("/api/organizer/created", organizers);
app.use("/api/tickets", tickets);
app.use("/api/analytics", analytics);

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
