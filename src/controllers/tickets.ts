import { Request, Response, NextFunction } from "express";
import Ticket from "../models/Ticket";
import Event from "../models/Event";
import { ITicket, IAuthor } from "../interfaces";
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

interface JwtPayload {
  eventId: string;
  attendeeId: string;
  userId: string;
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
      const attendee = await Attendee.findOne({ userId: authData.user._id });

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

      if (event.ticketsSold === event.capacity) {
        return res.status(410).json({
          success: false,
          error: "This event is sold out.",
        });
      }

      const ticketId =
        "ticket_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      const userId = authData.user._id;
      const eventId = event._id;

      const qrData = { eventId, ticketId, userId };
      const token = jwt.sign(qrData, "secretkey");

      QRCode.toDataURL(token, async (err, url) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Failed to generate QR code" });
        }

        const newTicket: ITicket = new Ticket({
          eventId,
          attendeeId: userId,
          qrCode: url,
          token,
          price: event.price,
        });

        const ticket = await newTicket.save();

        attendee.tickets.push(ticket);
        await attendee.save();

        event.tickets.push(ticket);
        event.ticketsSold += 1;
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

exports.scanTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { qrCode } = req.body;

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
        if (authData.user.role !== "organizer") {
          return res.status(403).json({
            success: false,
            error: "Forbidden - You can't do that!",
          });
        }

        let ticketToken = await Ticket.findOne({ qrCode });

        if (!ticketToken) {
          return res.status(404).json({
            success: false,
            message: "No ticket found.",
          });
        }

        const decodedToken = jwt.verify(
          ticketToken.token,
          "secretkey"
        ) as JwtPayload;

        if (!decodedToken) {
          return res.status(400).json({
            success: false,
            message: "Invalid QR code",
          });
        }

        const { eventId, userId } = decodedToken;

        let event = await Event.findOne({
          $and: [
            { _id: eventId },
            { "organizer.organizerId": authData.user._id },
          ],
        });

        let eventTicket = await Event.findOne({ _id: eventId });

        if (!event) {
          return res.status(404).json({
            success: false,
            message: "No event found.",
          });
        }

        if (!eventTicket) {
          return res.status(404).json({
            success: false,
            message: "No event found.",
          });
        }

        if (
          event.organizer.organizerId.toString() !==
          authData.user._id.toString()
        ) {
          return res.status(400).json({
            success: false,
            message: "Ticket not for this event.",
          });
        }

        const ticket: ITicket | null = await Ticket.findOne({
          eventId,
          attendeeId: userId,
          qrCode,
        });

        if (!ticket) {
          return res.status(404).json({
            success: false,
            message: "Ticket not found",
          });
        }

        if (ticket.scanned) {
          return res.status(400).json({
            success: false,
            message: "Ticket has already been scanned",
          });
        }

        ticket.scanned = true;
        await ticket.save();

        const updateEventTicket: ITicket | undefined = eventTicket.tickets.find(
          (ticket: ITicket) => ticket._id === ticket._id
        );

        if (updateEventTicket) {
          updateEventTicket.scanned = true;
          await eventTicket.save();
        } else {
          console.error("Ticket not found");
        }

        return res.status(200).json({
          success: true,
          message: "Ticket verified successfully",
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
