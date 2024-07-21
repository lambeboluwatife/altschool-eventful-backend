import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import Organizer from "../models/Organizer";
import Attendee from "../models/Attendee";

import bcrypt from "bcryptjs";
import passport from "passport";

interface AuthInfo {
  message: string;
  [key: string]: any;
}

exports.registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      username,
      email,
      role,
      organizationName,
      password,
      verifyPassword,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Enter name",
      });
    }

    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Enter username",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Enter email",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        error: "Enter role",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Enter password",
      });
    }

    if (!verifyPassword) {
      return res.status(400).json({
        success: false,
        error: "Enter verify password",
      });
    }

    if (role === "organizer" && !organizationName) {
      return res.status(400).json({
        message: "Organization name is required for organizers",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password should be a least 6 characters",
      });
    }

    if (password !== verifyPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match",
      });
    }

    User.findOne({ email: email }).then((user) => {
      if (user) {
        return res.status(409).json({
          success: false,
          error: "Email address already exist. Please use a different email.",
        });
      } else {
        const newUser = new User({
          name,
          username,
          email,
          role,
          password,
        });

        // Mash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, async (err, hash) => {
            if (err) throw err;
            // Set password to hashed
            newUser.password = hash;
            // Save user
            const savedUser = await newUser.save();
            if (role === "organizer") {
              // Create the organizer entry
              const newOrganizer = new Organizer({
                userId: savedUser._id,
                organizationName,
                createdEvents: [],
              });

              const savedOrganizer = await newOrganizer.save();

              res.status(201).json({
                message: "Organizer registered successfully",
                userId: savedUser._id,
                organizerId: savedOrganizer._id,
              });
            } else {
              // Create the attendee entry
              const newAttendee = new Attendee({
                userId: savedUser._id,
                appliedEvents: [],
              });

              const savedAttendee = await newAttendee.save();

              res.status(201).json({
                message: "Attendee registered successfully",
                userId: savedUser._id,
                attendeeId: savedAttendee._id,
              });
            }
          })
        );
      }
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val: any) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
};

exports.loginUser = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: IUser, info: AuthInfo) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message,
      });
    }
    req.logIn(user, function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }
      next();
    });
  })(req, res, next);
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.logout((err: any) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
