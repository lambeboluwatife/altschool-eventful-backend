import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User";

import User from "../models/User";
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
    const { name, email, password } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Enter name",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Enter email",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password should be a least 6 characters",
      });
    } else {
      User.findOne({ email: email }).then((user) => {
        if (user) {
          return res.status(409).json({
            success: false,
            error:
              "The email address is already registered. Please use a different email.",
          });
        } else {
          const newUser = new User({
            name,
            email,
            password,
          });

          // Mash Password
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              // Set password to hashed
              newUser.password = hash;
              // Save user
              const user = newUser.save();
              return res.status(201).json({
                success: true,
                data: "user registered",
              });
            })
          );
        }
      });
    }
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
