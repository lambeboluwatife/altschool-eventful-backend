import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    token?: string;
  }
}

// exports.generateToken = async (req: Request, res: Response) => {
//   jwt.sign(
//     { user: req.user },
//     "secretkey",
//     { expiresIn: "1h" },
//     (err, token) => {
//       if (err) {
//         return res.status(500).json({
//           success: false,
//           error: "Token generation failed",
//         });
//       }
//       return res.status(200).json({
//         success: true,
//         message: "Login successful",
//         token,
//       });
//     }
//   );
// };
exports.generateToken = async (req: Request, res: Response) => {
  jwt.sign(
    { user: req.user },
    "secretkey",
    { expiresIn: "1h" },
    (err, token) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: "Token generation failed",
        });
      }

      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
      });
    }
  );
};

exports.verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    if (bearer.length === 2) {
      const bearerToken = bearer[1];
      req.token = bearerToken;
      next();
    } else {
      return res.status(400).json({
        success: false,
        message: "Malformed token",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Missing Authorization header",
    });
  }
};
