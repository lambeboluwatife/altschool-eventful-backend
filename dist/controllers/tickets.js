"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Event_1 = __importDefault(require("../models/Event"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const qrcode_1 = __importDefault(require("qrcode"));
const Attendee_1 = __importDefault(require("../models/Attendee"));
exports.generateTicket = async (req, res, next) => {
    const token = req.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized: Missing token",
        });
    }
    jsonwebtoken_1.default.verify(token, "secretkey", async (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: "Forbidden",
            });
        }
        const authData = decoded;
        try {
            const event = await Event_1.default.findById(req.params.id);
            const attendee = await Attendee_1.default.findOne({ userId: authData.user._id });
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
            const ticketId = "ticket_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
            const userId = authData.user._id;
            const eventId = event._id;
            const qrData = { eventId, ticketId, userId };
            const token = jsonwebtoken_1.default.sign(qrData, "secretkey");
            qrcode_1.default.toDataURL(token, async (err, url) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ message: "Failed to generate QR code" });
                }
                const newTicket = new Ticket_1.default({
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
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    });
};
exports.scanTicket = async (req, res, next) => {
    const { qrCode } = req.body;
    const token = req.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized: Missing token",
        });
    }
    jsonwebtoken_1.default.verify(token, "secretkey", async (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: "Forbidden",
            });
        }
        else {
            const authData = decoded;
            try {
                if (authData.user.role !== "organizer") {
                    return res.status(403).json({
                        success: false,
                        error: "Forbidden - You can't do that!",
                    });
                }
                let ticketToken = await Ticket_1.default.findOne({ qrCode });
                if (!ticketToken) {
                    return res.status(404).json({
                        success: false,
                        message: "No ticket found.",
                    });
                }
                const decodedToken = jsonwebtoken_1.default.verify(ticketToken.token, "secretkey");
                if (!decodedToken) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid QR code",
                    });
                }
                const { eventId, userId } = decodedToken;
                let event = await Event_1.default.findOne({
                    $and: [
                        { _id: eventId },
                        { "organizer.organizerId": authData.user._id },
                    ],
                });
                let eventTicket = await Event_1.default.findOne({ _id: eventId });
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
                if (event.organizer.organizerId.toString() !==
                    authData.user._id.toString()) {
                    return res.status(400).json({
                        success: false,
                        message: "Ticket not for this event.",
                    });
                }
                const ticket = await Ticket_1.default.findOne({
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
                const updateEventTicket = eventTicket.tickets.find((ticket) => ticket._id === ticket._id);
                if (updateEventTicket) {
                    updateEventTicket.scanned = true;
                    await eventTicket.save();
                }
                else {
                    console.error("Ticket not found");
                }
                return res.status(200).json({
                    success: true,
                    message: "Ticket verified successfully",
                });
            }
            catch (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message,
                });
            }
        }
    });
};
