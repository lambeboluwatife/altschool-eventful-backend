"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventAnalytics = exports.getOverallAnalytics = void 0;
const Event_1 = __importDefault(require("../models/Event"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_cache_1 = __importDefault(require("node-cache"));
const myCache = new node_cache_1.default();
const getOverallAnalytics = async (req, res, next) => {
    const token = req.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized: Missing token",
        });
    }
    try {
        const authData = await new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, "secretkey", (err, decoded) => {
                if (err)
                    return reject(err);
                resolve(decoded);
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
        const events = await Event_1.default.find({
            "organizer.organizerId": organizerId,
        }).exec();
        const totalApplicants = events.reduce((acc, event) => acc + event.applicants.length, 0);
        const totalTicketSold = events.reduce((acc, event) => acc + event.ticketsSold, 0);
        const totalScannedTickets = events.reduce((acc, event) => {
            const scannedTicketsCount = event.tickets.filter((ticket) => ticket.scanned).length;
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};
exports.getOverallAnalytics = getOverallAnalytics;
const getEventAnalytics = async (req, res, next) => {
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
            const event = await Event_1.default.findById(eventId);
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
            const attendees = await Ticket_1.default.countDocuments({ eventId });
            const ticketsSold = event.ticketsSold;
            const scannedTickets = await Ticket_1.default.countDocuments({
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
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    });
};
exports.getEventAnalytics = getEventAnalytics;
