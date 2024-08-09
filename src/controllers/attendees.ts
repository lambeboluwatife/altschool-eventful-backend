import { Request, Response, NextFunction } from "express";
import Event from "../models/Event";
import { IAuthor, IApplicant } from "../interfaces";
import jwt from "jsonwebtoken";
import Attendee from "../models/Attendee";

declare module "express-serve-static-core" {
  interface Request {
    token?: string;
  }
}

interface AuthData {
  user: IAuthor;
}

exports.getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await Event.find();

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events.length === 0 ? "No Events" : events,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.applyToEvent = async (
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
    }

    const authData = decoded as AuthData;

    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          success: false,
          error: "No event found",
        });
      }

      const attendee = await Attendee.findOne({
        userId: authData.user._id,
      }).exec();

      if (!attendee) {
        return res.status(404).json({
          success: false,
          message: "Attendee details not found",
        });
      }

      const alreadyApplied = event.applicants.some(
        (applicant: IApplicant) =>
          applicant.applicantId.toString() === authData.user._id.toString()
      );

      if (alreadyApplied) {
        return res.status(405).json({
          success: false,
          error: "Already applied.",
        });
      }

      if (
        event.organizer.organizerId.toString() === authData.user._id.toString()
      ) {
        return res.status(405).json({
          success: false,
          error: "You can't apply for your own event.",
        });
      }

      event.applicants.push({
        applicantId: authData.user._id,
        name: authData.user.name,
        username: authData.user.username,
        email: authData.user.email,
      });

      await event.save();

      await Attendee.findByIdAndUpdate(attendee, {
        $push: { appliedEvents: event },
      });

      return res.status(200).json({
        success: true,
        message: "Applied for event successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });
};

exports.appliedEvent = async (
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
        let event = await Event.findOne({
          "applicants.applicantId": authData.user._id,
        });

        if (!event) {
          return res.status(404).json({
            success: false,
            error: "No event found",
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
        const eventId = req.params.id;
        const { reminderTime } = req.body;

        let attendee = await Attendee.findOne({
          userId: authData.user._id,
        });

        let event = await Event.findOne({
          _id: eventId,
        });

        if (!attendee) {
          return res.status(404).json({
            success: false,
            message: "No Attendee Found.",
          });
        }

        if (!event) {
          return res.status(404).json({
            success: false,
            message: "No Event Found.",
          });
        }

        attendee.reminders.push({
          eventId,
          reminderTime,
          email: authData.user.email,
        });
        await attendee.save();

        event.reminders.push({
          reminderTime,
          email: authData.user.email,
        });
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
