// import Blog from "../models/Blog";

// exports.ensureAuthenticated = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   return res.status(403).json({
//     success: false,
//     message: "Please login to do that.",
//   });
// };

// exports.checkBlogOwnership = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (req.isAuthenticated()) {
//     let blog = await Blog.findById(req.params.id);

//     if (blog === null) {
//       return res.status(403).json({
//         success: false,
//         message: "Blog not found.",
//       });
//     } else {
//       if (blog.author.id.equals(req.user._id)) {
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
