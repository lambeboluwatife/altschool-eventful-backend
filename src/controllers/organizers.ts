import { Request, Response, NextFunction } from "express";
import Event from "../models/Event";
import { IApplicant, IAuthor, IEvent } from "../interfaces";
import jwt from "jsonwebtoken";
import NodeCache from "node-cache";

const myCache = new NodeCache();

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
    }

    const authData = decoded as AuthData;
    const organizerId = authData.user._id;

    if (authData.user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        error: "Forbidden - You can't do that!",
      });
    }

    try {
      const cacheKey = `createdEvents-${organizerId}`;
      const cachedCreatedEvents = myCache.get<IEvent[]>(cacheKey);

      if (cachedCreatedEvents) {
        return res.status(200).json({
          success: true,
          count: cachedCreatedEvents.length,
          data: cachedCreatedEvents,
        });
      }

      const events = await Event.find({
        "organizer.organizerId": organizerId,
      }).exec();

      if (events.length > 0) {
        const eventsToCache = events.map((event) => event.toObject());

        myCache.set(cacheKey, eventsToCache, 1800);
      }

      return res.status(200).json({
        success: true,
        count: events.length,
        data: events,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
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
    }

    const authData = decoded as AuthData;

    if (authData.user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        error: "Forbidden - You can't do that!",
      });
    }

    const eventId = req.params.id;
    const cacheKey = `event-${eventId}-${authData.user._id}`;

    try {
      const cachedEvent = myCache.get<IEvent>(cacheKey);

      if (cachedEvent) {
        return res.status(200).json({
          success: true,
          data: cachedEvent,
        });
      }

      const event = await Event.findOne({
        $and: [
          { _id: eventId },
          { "organizer.organizerId": authData.user._id },
        ],
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "No Event Found.",
        });
      }

      myCache.set(cacheKey, event.toObject(), 1800);

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
    }

    const authData = decoded as AuthData;

    if (authData.user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        error: "Forbidden - You can't do that!",
      });
    }

    const eventId = req.params.id;
    const cacheKey = `event-applicants-${eventId}-${authData.user._id}`;

    try {
      const cachedApplicants = myCache.get<IApplicant[]>(cacheKey);

      if (cachedApplicants) {
        return res.status(200).json({
          success: true,
          data: cachedApplicants,
        });
      }

      const event = await Event.findOne({
        $and: [
          { _id: eventId },
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

      myCache.set(cacheKey, event.applicants, 1800);
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
