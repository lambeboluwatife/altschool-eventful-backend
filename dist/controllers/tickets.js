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
            let attendee = yield Attendee_1.default.findOne({
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
            const ticketId = "ticket_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
            const userId = authData.user._id;
            const eventId = event._id;
            const qrData = JSON.stringify({ eventId, ticketId, userId });
            qrcode_1.default.toDataURL(qrData, (err, url) => __awaiter(void 0, void 0, void 0, function* () {
                if (err)
                    return res
                        .status(500)
                        .json({ message: "Failed to generate QR code" });
                const newTicket = new Ticket_1.default({
                    eventId,
                    attendeeId: userId,
                    qrCode: url,
                    price: event.price,
                });
                const ticket = yield newTicket.save();
                attendee.tickets.push({
                    eventId,
                    attendeeId: userId,
                    qrCode: url,
                    price: event.price,
                });
                yield attendee.save();
                event.tickets.push({
                    eventId,
                    attendeeId: userId,
                    qrCode: url,
                    price: event.price,
                });
                event.ticketsSold = event.ticketsSold + 1;
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
