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
exports.getEventAnalytics = exports.getOverallAnalytics = void 0;
const Event_1 = __importDefault(require("../models/Event"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getOverallAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized: Missing token',
        });
    }
    jsonwebtoken_1.default.verify(token, 'secretkey', (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
            });
        }
        const authData = decoded;
        const organizerId = authData.user._id;
        try {
            if (authData.user.role !== "organizer") {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden - You can't do that!",
                });
            }
            const events = yield Event_1.default.find({
                "organizer.organizerId": organizerId,
            }).exec();
            const totalApplicants = events.reduce((acc, event) => acc + event.applicants.length, 0);
            const totalTicketSold = events.reduce((acc, event) => acc + event.ticketsSold, 0);
            const totalScannedTickets = events.reduce((acc, event) => {
                return acc + event.tickets.filter((ticket) => ticket.scanned);
            }, 0);
            // const totalScannedTickets = events.tickets.filter((ticket: { scanned: boolean; }) => ticket.scanned)
            res.status(200).json({
                success: true,
                data: {
                    totalApplicants,
                    totalTicketSold,
                    totalScannedTickets
                }
            });
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    }));
});
exports.getOverallAnalytics = getOverallAnalytics;
const getEventAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized: Missing token',
        });
    }
    jsonwebtoken_1.default.verify(token, 'secretkey', (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
            });
        }
        const authData = decoded;
        const organizerId = authData.user._id;
        const eventId = req.params.id;
        try {
            const event = yield Event_1.default.findById(eventId);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'No event found',
                });
            }
            if (event.organizer.organizerId.toString() !== organizerId) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden - You do not have access to this event',
                });
            }
            const attendees = yield Ticket_1.default.countDocuments({ eventId });
            const ticketsSold = event.ticketsSold;
            const scannedTickets = yield Ticket_1.default.countDocuments({ eventId, scanned: true });
            res.status(200).json({
                success: true,
                data: {
                    attendees,
                    ticketsSold,
                    scannedTickets,
                },
            });
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    }));
});
exports.getEventAnalytics = getEventAnalytics;
