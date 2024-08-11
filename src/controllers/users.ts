import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { IUser } from "../interfaces";
import Organizer from "../models/Organizer";
import Attendee from "../models/Attendee";
import { authSchema } from "../utils/validationSchema";

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
    const validInputs = await authSchema.validateAsync(req.body);

    if (validInputs.role === "organizer" && !validInputs.organizationName) {
      return res.status(400).json({
        message: "Organization name is required for organizers",
      });
    }

    User.findOne({ email: validInputs.email }).then((user) => {
      if (user) {
        return res.status(409).json({
          success: false,
          error: "Email address already exist. Please use a different email.",
        });
      } else {
        const newUser = new User(validInputs);

        // Mash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, async (err, hash) => {
            if (err) throw err;
            // Set password to hashed
            newUser.password = hash;
            // Save user
            const savedUser = await newUser.save();
            if (validInputs.role === "organizer") {
              // Create the organizer entry
              const newOrganizer = new Organizer({
                userId: savedUser._id,
                organizationName: validInputs.organizationName,
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
  } catch (error: any) {
    if (error.isJoi) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: error.message,
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
