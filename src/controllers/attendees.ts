import { Request, Response, NextFunction } from "express";
import Event, { IEvent, IAuthor, IApplicant } from "../models/Event";
import User from "../models/User";
import Organizer from "../models/Organizer";
import jwt from "jsonwebtoken";

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
