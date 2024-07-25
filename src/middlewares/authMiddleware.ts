import { Request, Response, NextFunction } from "express";
import Event from "../models/Event";
import User from "../models/User";

interface User {
  _id: string;
  role: string;
}

exports.ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Please login to do that.",
  });
};

// export const checkEventOwnership = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (req.isAuthenticated()) {
//     try {
//       const event = await Event.findById(req.params.id);

//       if (!event) {
//         return res.status(403).json({
//           success: false,
//           message: "Event not found.",
//         });
//       }

//       if (event.organizer.organizerId === req.user.id) {
//         next();
//       } else {
//         return res.status(403).json({
//           success: false,
//           message: "You don't have permission to do that.",
//         });
//       }
//     } catch (err) {
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//       });
//     }
//   } else {
//     return res.status(403).json({
//       success: false,
//       message: "Please log in to do that.",
//     });
//   }
// };
