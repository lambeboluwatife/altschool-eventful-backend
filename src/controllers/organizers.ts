import { Request, Response, NextFunction } from "express";
import Event, { IEvent, IAuthor, IApplicant } from "../models/Event";
import User from "../models/User";
import Organizer from "../models/Organizer";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    token?: string;
  }
}

interface AuthData {
  user: IAuthor;
}

exports.getCreatedEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const token = req.token;
  
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Missing token",
      });
    }
  
    jwt.verify(token, "secretkey", async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
        });
      } else {
        const authData = decoded as AuthData;
        const organizerId = authData.user._id;
  
        try {
          if (authData.user.role !== "organizer") {
            return res.status(403).json({
              success: false,
              error: "Forbidden - You can't do that!",
            });
          }
  
          const event = await Event.find({
            "organizer.organizerId": organizerId,
          }).exec();
  
          return res.status(200).json({
            success: true,
            events: event.length,
            data: event,
          });
        } catch (err: any) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }
      }
    });
  };
  
  exports.getSingleEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const token = req.token;
  
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Missing token",
      });
    }
  
    jwt.verify(token, "secretkey", async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
        });
      } else {
        const authData = decoded as AuthData;
  
        try {
          if (authData.user.role !== "organizer") {
            return res.status(403).json({
              success: false,
              error: "Forbidden - You can't do that!",
            });
          }
  
          let event = await Event.findOne({
            $and: [
              { _id: req.params.id },
              { "organizer.organizerId": authData.user._id },
            ],
          });
  
          if (!event) {
            return res.status(404).json({
              success: false,
              message: "No Event Found.",
            });
          }
  
          return res.status(200).json({
            success: true,
            data: event,
          });
        } catch (err: any) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }
      }
    });
  };
  
  exports.getEventApplicants = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const token = req.token;
  
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Missing token",
      });
    }
  
    jwt.verify(token, "secretkey", async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
        });
      } else {
        const authData = decoded as AuthData;
  
        if (authData.user.role !== "organizer") {
          return res.status(403).json({
            success: false,
            error: "Forbidden - You can't do that!",
          });
        }
  
        try {
          let event = await Event.findOne({
            $and: [
              { _id: req.params.id },
              { "organizer.organizerId": authData.user._id },
            ],
          });
  
          if (!event) {
            return res.status(404).json({
              success: false,
              error:
                "No event found or you do not have permission to view applicants for this event",
            });
          }
  
          return res.status(200).json({
            success: true,
            data: event.applicants,
          });
        } catch (err: any) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }
      }
    });
  };
  
  exports.setReminder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const token = req.token;
  
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Missing token",
      });
    }
  
    jwt.verify(token, "secretkey", async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
        });
      } else {
        const authData = decoded as AuthData;
  
        try {
          const { reminderTime } = req.body;
  
          if (authData.user.role !== "organizer") {
            return res.status(403).json({
              success: false,
              error: "Forbidden - You can't do that!",
            });
          }
  
          let event = await Event.findOne({
            $and: [
              { _id: req.params.id },
              { "organizer.organizerId": authData.user._id },
            ],
          });
  
          if (!event) {
            return res.status(404).json({
              success: false,
              message: "No Event Found.",
            });
          }
  
          event.reminders.push({ reminderTime, email: authData.user.email });
          await event.save();
  
          res.status(201).json({ message: "Reminder set successfully" });
        } catch (err: any) {
          return res.status(500).json({
            success: false,
            message: "Error setting reminder",
            error: err.message,
          });
        }
      }
    });
  };
  