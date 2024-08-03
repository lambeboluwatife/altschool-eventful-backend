"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Event_1 = __importDefault(require("../models/Event"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const qrcode_1 = __importDefault(require("qrcode"));
const Attendee_1 = __importDefault(require("../models/Attendee"));
exports.generateTicket = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized: Missing token",
        });
    }
    jsonwebtoken_1.default.verify(token, "secretkey", (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(403).json({
                success: false,
                error: "Forbidden",
            });
        }
        const authData = decoded;
        try {
            const event = yield Event_1.default.findById(req.params.id);
            const attendee = yield Attendee_1.default.findOne({ userId: authData.user._id });
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
            const ticketId = "ticket_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
            const userId = authData.user._id;
            const eventId = event._id;
            const qrData = { eventId, ticketId, userId };
            const token = jsonwebtoken_1.default.sign(qrData, "secretkey");
            qrcode_1.default.toDataURL(token, (err, url) => __awaiter(void 0, void 0, void 0, function* () {
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
                console.log("New Ticket:", newTicket);
                const ticket = yield newTicket.save();
                attendee.tickets.push(ticket);
                yield attendee.save();
                event.tickets.push(ticket);
                event.ticketsSold += 1;
                yield event.save();
                res.status(200).json({ ticketId, qrCode: url });
            }));
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    }));
});
exports.scanTicket = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { qrCode } = req.body;
    const token = req.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized: Missing token",
        });
    }
    jsonwebtoken_1.default.verify(token, "secretkey", (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
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
                let ticketToken = yield Ticket_1.default.findOne({ qrCode });
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
                const { eventId, attendeeId, userId } = decodedToken;
                console.log(eventId, attendeeId, userId);
                let event = yield Event_1.default.findOne({
                    $and: [
                        { _id: eventId },
                        { "organizer.organizerId": authData.user._id },
                    ],
                });
                if (!event) {
                    return res.status(404).json({
                        success: false,
                        message: "No event found.",
                    });
                }
                if (event.organizer.organizerId !== authData.user._id) {
                    return res.status(400).json({
                        success: false,
                        message: "Ticket not for this event.",
                    });
                }
                const ticket = yield Ticket_1.default.findOne({
                    eventId,
                    attendeeId,
                    userId,
                    qrCode,
                });
                if (!ticket) {
                    return res.status(404).json({
                        success: false,
                        message: "Ticket not found",
                    });
                }
                if (ticket.used) {
                    return res.status(400).json({
                        success: false,
                        message: "Ticket has already been used",
                    });
                }
                ticket.used = true;
                yield ticket.save();
                return res.status(200).json({
                    success: true,
                    message: "Ticket verified successfully",
                    data: ticket,
                });
            }
            catch (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message,
                });
            }
        }
    }));
});
