"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: "Please login to do that.",
    });
};
// exports.checkEventOwnership = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (req.isAuthenticated()) {
//     let event = await Event.findById(req.params.id);
//     if (event === null) {
//       return res.status(403).json({
//         success: false,
//         message: "Event not found.",
//       });
//     } else {
//       if (event.author.id === req.user.id) {
//         next();
//       } else {
//         return res.status(403).json({
//           success: false,
//           message: "You don't have permission to do that.",
//         });
//       }
//     }
//   } else {
//     return res.status(403).json({
//       success: false,
//       message: "Please login to do that.",
//     });
//   }
// };
