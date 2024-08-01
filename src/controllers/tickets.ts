import { Request, Response, NextFunction } from "express";
import Ticket, { ITicket } from "../models/Ticket";
import Event, { IAuthor } from "../models/Event";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import Attendee from "../models/Attendee";

declare module "express-serve-static-core" {
  interface Request {
    token?: string;
  }
}

interface AuthData {
  user: IAuthor;
}

exports.generateTicket = async (
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
      let attendee = await Attendee.findOne({
        userId: authData.user._id,
      });

      if (!attendee) {
        return res.status(404).json({
          success: false,
          message: "No Attendee Found.",
        });
      }

      if (!event) {
        return res.status(404).json({
          success: false,
          error: "No event found",
        });
      }

      const ticketId =
        "ticket_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

      const userId = authData.user._id;
      const eventId = event._id;

      const qrData = JSON.stringify({ eventId, ticketId, userId });

      QRCode.toDataURL(qrData, async (err, url) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Failed to generate QR code" });

        const newTicket: ITicket = new Ticket({
          eventId,
          attendeeId: userId,
          qrCode: url,
          price: event.price,
        });

        const ticket = await newTicket.save();

        attendee.tickets.push({
          eventId,
          attendeeId: userId,
          qrCode: url,
          price: event.price,
        });
        await attendee.save();

        event.tickets.push({
          eventId,
          attendeeId: userId,
          qrCode: url,
          price: event.price,
        });
        event.ticketsSold = event.ticketsSold + 1;
        await event.save();

        res.status(200).json({ ticketId, qrCode: url });
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });
};
