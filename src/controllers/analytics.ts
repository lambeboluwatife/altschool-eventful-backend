import { Request, Response, NextFunction } from "express";
import Event from "../models/Event";
import Ticket from "../models/Ticket";
import { IAuthor } from "../interfaces";
import jwt from "jsonwebtoken";
import NodeCache from "node-cache";

const myCache = new NodeCache();

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

  try {
    const authData = await new Promise<AuthData>((resolve, reject) => {
      jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded as AuthData);
      });
    });

    if (authData.user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        error: "Forbidden - You can't do that!",
      });
    }

    const organizerId = authData.user._id;

    const cacheId = `overallAnalytics-${organizerId}`;
    const cachedOverallAnalytics = myCache.get(cacheId);

    if (cachedOverallAnalytics) {
      return res.status(200).json({
        success: true,
        data: cachedOverallAnalytics,
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
      const scannedTicketsCount = event.tickets.filter(
        (ticket: { scanned: boolean }) => ticket.scanned
      ).length;
      return acc + scannedTicketsCount;
    }, 0);

    const val = { totalApplicants, totalTicketSold, totalScannedTickets };
    const ttl = 1800;
    myCache.set(cacheId, val, ttl);

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
      const cacheKey = `eventAnalytics-${eventId}`;

      const cachedAnalytics = myCache.get(cacheKey);
      if (cachedAnalytics) {
        return res.status(200).json({
          success: true,
          data: cachedAnalytics,
        });
      }

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

      const analyticsData = {
        attendees,
        ticketsSold,
        scannedTickets,
      };

      const ttl = 1800;
      myCache.set(cacheKey, analyticsData, ttl);

      res.status(200).json({
        success: true,
        data: analyticsData,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });
};
