import dotenv from "dotenv";
import express, { Application, Request, Response, NextFunction } from "express";
import "colors";
import morgan from "morgan";
import passport from "./config/passport";
import session from "express-session";

// const connectDB = require("./config/db");
import connectDB from "./config/db";

dotenv.config({ path: "./src/config/config.env" });

// Passport config
// require("./config/passport")(passport);

connectDB();

const app: Application = express();

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

app.get("/", (req: Request, res: Response) => {
  res.send("hello");
});

app.use("/users", users);
app.use("/events", events);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.all("*", (req, res) => {
  res.status(404).send("404 - route not found");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});
