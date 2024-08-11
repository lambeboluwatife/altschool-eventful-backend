import { Request, Response, NextFunction } from "express";
import Event from "../models/Event";
import { IEvent, IAuthor } from "../interfaces";
import User from "../models/User";
import Organizer from "../models/Organizer";
import { cloudinary } from "../config/cloudinaryConfig";
import jwt from "jsonwebtoken";
import fs from "fs";
import { Document } from "mongoose";
import NodeCache from "node-cache";
import { eventSchema } from "../utils/validationSchema";

const myCache = new NodeCache();

declare module "express-serve-static-core" {
  interface Request {
    token?: string;
  }
}

interface AuthData {
  user: IAuthor;
}

exports.getSingleEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const eventId = req.params.id;

  try {
    const cachedEvent = myCache.get<IEvent>(eventId);
    if (cachedEvent) {
      return res.status(200).json({
        success: true,
        data: cachedEvent,
      });
    }

    const event = await Event.findOne({ _id: eventId }).exec();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "No Event Found.",
      });
    }

    const key: string = event._id.toString();
    const val: IEvent = event.toObject();
    const ttl: number = 1800;
    myCache.set(key, val, ttl);

    return res.status(200).json({
      success: true,
      data: val,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventKeys = myCache.keys().filter((key) => key.startsWith("event-"));
    const cachedEvents = myCache.mget<IEvent>(eventKeys);

    if (Object.keys(cachedEvents).length > 0) {
      return res.status(200).json({
        success: true,
        count: Object.keys(cachedEvents).length,
        data: Object.values(cachedEvents),
      });
    }

    const events = (await Event.find()) as (Document<unknown, {}, IEvent> &
      IEvent &
      Required<{ _id: unknown }>)[];

    if (events.length > 0) {
      const eventsToCache = events.map((event) => ({
        key: `event-${event._id.toString()}`,
        val: event.toObject(),
        ttl: 1800,
      }));

      myCache.mset(eventsToCache);
    }

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.searchEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { search } = req.body;
  const newSearch = new RegExp(search, "i");

  try {
    const events = await Event.find({
      $or: [
        { title: newSearch },
        { location: newSearch },
        { category: newSearch },
        { "organizer.organizationName": newSearch },
      ],
    });

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

exports.addEvent = async (req: Request, res: Response, next: NextFunction) => {
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
        const user = await User.findById(authData.user._id).exec();
        if (!user || user.role !== "organizer") {
          return res.status(403).json({
            message: "Access denied. Only organizers can perform this action.",
          });
        }

        const organizer = await Organizer.findOne({
          userId: authData.user._id,
        }).exec();
        if (!organizer) {
          return res.status(404).json({
            success: false,
            message: "Organizer details not found",
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "No file uploaded",
          });
        }

        const result = await cloudinary.uploader.upload(req.file.path);

        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(err);
          }
        });

        const validInputs = await eventSchema.validateAsync(req.body);

        const reminder = {
          reminderTime: validInputs.reminders,
          email: authData.user.email,
        };

        const newEvent: IEvent = new Event({
          ...validInputs,
          backdrop: result.secure_url,
          applicants: [],
          tickets: [],
          reminders: reminder,
          organizer: {
            organizerId: authData.user._id,
            organizationName: organizer?.organizationName,
            email: authData.user.email,
          },
        });

        const event = await newEvent.save();

        await Organizer.findByIdAndUpdate(organizer, {
          $push: { createdEvents: event },
        });

        return res.status(201).json({
          success: true,
          data: event,
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
    }
  });
};

// exports.updateEvent = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.token;

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       error: "Unauthorized: Missing token",
//     });
//   }

//   jwt.verify(token, "secretkey", async (err, decoded) => {
//     if (err) {
//       return res.status(403).json({
//         success: false,
//         error: "Forbidden",
//       });
//     } else {
//       const authData = decoded as AuthData;

//       if (authData.user.role !== "organizer") {
//         return res.status(403).json({
//           success: false,
//           error: "Forbidden - You can't do that!",
//         });
//       }

//       try {
//         const eventId = req.params.id;
//         const updateData = req.body;

//         const event = await Event.findById(eventId);
//         console.log(event);

//         if (!event) {
//           return res.status(404).json({
//             success: false,
//             message: "No Event Found.",
//           });
//         }

//         console.log(updateData);
//         console.log(req.body);

//         await Event.findByIdAndUpdate(event, {
//           updateData,
//         });

//         return res.status(200).json({
//           success: true,
//           data: event,
//         });
//       } catch (err: any) {
//         return res.status(500).json({
//           success: false,
//           error: err.message,
//         });
//       }
//     }
//   });
// };

exports.deleteEvent = async (
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
            error: "No event found",
          });
        }

        await event.deleteOne();

        return res.status(200).json({
          success: true,
          data: {},
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
