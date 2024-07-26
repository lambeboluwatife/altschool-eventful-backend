import { Request, Response, NextFunction } from "express";
import Event, { IEvent, IAuthor } from "../models/Event";
import User from "../models/User";
import Organizer from "../models/Organizer";
import { cloudinary } from "../config/cloudinaryConfig";
import jwt from "jsonwebtoken";
import fs from "fs";

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

        // delete file from file directory
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(err);
          }
        });

        const {
          title,
          location,
          category,
          description,
          date,
          time,
          price,
          capacity,
          applicants,
          ticketsSold,
          reminders,
          createdAt,
        } = req.body;

        const reminder = { reminderTime: reminders, sent: false };

        const newEvent: IEvent = new Event({
          title,
          location,
          category,
          description,
          date,
          time,
          price,
          capacity,
          backdrop: result.secure_url,
          applicants: [],
          ticketsSold,
          reminders: reminder,
          createdAt,
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
      } catch (err: any) {
        if (err.name === "ValidationError") {
          const messages = Object.values(err.errors).map(
            (val: any) => val.message
          );
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
    }
  });
};

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
//             message: "Event not found.",
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
    } else {
      const authData = decoded as AuthData;

      try {
        let event = await Event.findOne({ _id: req.params.id });

        if (!event) {
          return res.status(404).json({
            success: false,
            error: "No event found",
          });
        }

        await Event.findByIdAndUpdate(event, {
          $push: {
            applicants: {
              applicantId: authData.user._id,
              name: authData.user.name,
              username: authData.user.username,
              email: authData.user.email,
            },
          },
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
