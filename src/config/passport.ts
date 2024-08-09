import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
// import bcrypt from "bcryptjs";
const bcrypt = require("bcryptjs");
import User from "../models/User";
import { IUser } from "../interfaces";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        // Match Password
        bcrypt.compare(
          password,
          user.password,
          (err: any, isMatch: boolean) => {
            if (err) {
              return done(err);
            }

            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "Incorrect email or password.",
              });
            }
          }
        );
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user instance to session
passport.serializeUser((user, done) => {
  done(null, (user as IUser)._id);
});

// Deserialize user instance from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = (await User.findById(id)) as IUser;
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
