import { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.checkAuthStatus = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ isAuthenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ isAuthenticated: false });
    }

    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Authentication check failed:", error);
    res.status(401).json({ isAuthenticated: false });
  }
};
