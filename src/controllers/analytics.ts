import { Request, Response, NextFunction } from "express";
import Event from "../models/Event";
import Ticket from "../models/Ticket";
import { IAuthor } from "../interfaces";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    token?: string;
  }
}

interface AuthData {
  user: IAuthor;
}

export const getOverallAnalytics = async (
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

    try {
      if (authData.user.role !== "organizer") {
        return res.status(403).json({
          success: false,
          error: "Forbidden - You can't do that!",
        });
      }

      const events = await Event.find({
        "organizer.organizerId": organizerId,
      }).exec();

      const totalApplicants = events.reduce(
        (acc, event) => acc + event.applicants.length,
        0
      );
      const totalTicketSold = events.reduce(
        (acc, event) => acc + event.ticketsSold,
        0
      );
      const totalScannedTickets = events.reduce((acc, event) => {
        return (
          acc +
          event.tickets.filter((ticket: { scanned: boolean }) => ticket.scanned)
        );
      }, 0);

      res.status(200).json({
        success: true,
        data: {
          totalApplicants,
          totalTicketSold,
          totalScannedTickets,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });
};

export const getEventAnalytics = async (
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
    const eventId = req.params.id;

    try {
      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({
          success: false,
          error: "No event found",
        });
      }

      if (event.organizer.organizerId.toString() !== organizerId) {
        return res.status(403).json({
          success: false,
          error: "Forbidden - You do not have access to this event",
        });
      }

      const attendees = await Ticket.countDocuments({ eventId });
      const ticketsSold = event.ticketsSold;
      const scannedTickets = await Ticket.countDocuments({
        eventId,
        scanned: true,
      });

      res.status(200).json({
        success: true,
        data: {
          attendees,
          ticketsSold,
          scannedTickets,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });
};
