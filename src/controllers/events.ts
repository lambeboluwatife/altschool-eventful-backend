import { Request, Response, NextFunction } from "express";
import Event, { IEvent, IAuthor } from "../models/Event";
import { cloudinary } from "../config/cloudinaryConfig";
import jwt from "jsonwebtoken";
import moment from "moment";
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
            return;
          }
        });

        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });

        const {
          name,
          organizer,
          venue,
          category,
          description,
          date,
          time,
          price,
          ticket,
          createdAt,
        } = req.body;

        // const parsedDate = moment(date, "dddd, MMMM DD, YYYY").format();

        const newEvent: IEvent = new Event({
          name,
          organizer,
          venue,
          category,
          description,
          date,
          time,
          price,
          ticket,
          backdrop: result.secure_url,
          createdAt,
          author: {
            _id: authData.user._id,
            name: authData.user.name,
            email: authData.user.email,
          },
        });

        const event = await newEvent.save();

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

// exports.getEvent = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let event = await Event.findById(req.params.id)
//       .where("state")
//       .equals(true);

//     if (event === null) {
//       return res.status(200).json({
//         success: true,
//         data: "No Event with that ID found",
//       });
//     } else {
//       event.read_count = event.read_count + 1;
//       event = await event.save();

//       return res.status(200).json({
//         success: true,
//         data: event,
//       });
//     }
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

// exports.addEvent = async (req: Request, res: Response, next: NextFunction) => {
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
//       try {
//         // Using multer to handle the file upload
//         upload.single("file")(req, res, async (err: any) => {
//           if (err) {
//             return res.status(400).json({
//               success: false,
//               message: "File upload failed",
//               error: err.message,
//             });
//           }

//           // Check if req.file exists before uploading to Cloudinary
//           if (!req.file) {
//             return res.status(400).json({
//               success: false,
//               message: "No file uploaded",
//             });
//           }

//           // Uploading file to Cloudinary
//           const result = await cloudinary.uploader.upload(req.file.path);
//         });

//         const {
//           name,
//           venue,
//           category,
//           description,
//           date,
//           time,
//           price,
//           backdrop,
//           createdAt,
//         } = req.body;

//         const author: IAuthor = {
//           _id: authData.user._id,
//           name: authData.user.name,
//           email: authData.user.email,
//         };

//         const newEvent = new Event({
//           name,
//           venue,
//           category,
//           description,
//           date,
//           time,
//           price,
//           backdrop,
//           createdAt,
//           author,
//         });
//         const event = await newEvent.save();
//         return res.status(201).json({
//           success: true,
//           data: event,
//         });
//       } catch (err: any) {
//         if (err.name === "ValidationError") {
//           const messages = Object.values(err.errors).map(
//             (val: any) => val.message
//           );
//           return res.status(400).json({
//             success: false,
//             error: messages,
//           });
//         } else {
//           return res.status(500).json({
//             success: false,
//             error: err.message,
//           });
//         }
//       }
//     }
//   });
// };

// exports.updateEvent = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const updateFields = req.body;

//     let event = await Event.findById(req.params.id);

//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         error: "No event found",
//       });
//     }

//     Object.keys(updateFields).forEach((key) => {
//       if (updateFields[key] !== undefined) {
//         event[key] = updateFields[key];
//       }
//     });

//     event = await event.save();

//     return res.status(200).json({
//       success: true,
//       data: event,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       error: "Server Error",
//     });
//   }
// };

exports.deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await Event.findById(req.params.id);

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
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
