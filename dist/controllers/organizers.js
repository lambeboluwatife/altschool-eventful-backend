"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../models/Event"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_cache_1 = __importDefault(require("node-cache"));
const myCache = new node_cache_1.default();
exports.getCreatedEvents = async (req, res, next) => {
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
            const organizerId = authData.user._id;
            try {
                if (authData.user.role !== "organizer") {
                    return res.status(403).json({
                        success: false,
                        error: "Forbidden - You can't do that!",
                    });
                }
                const cachedCreatedEvents = myCache.mget(myCache.keys());
                if (Object.keys(cachedCreatedEvents).length > 0) {
                    return res.status(200).json({
                        success: true,
                        count: Object.keys(cachedCreatedEvents).length,
                        data: Object.values(cachedCreatedEvents),
                    });
                }
                const events = await Event_1.default.find({
                    "organizer.organizerId": organizerId,
                }).exec();
                if (events.length > 0) {
                    const eventsToCache = events.map((event) => ({
                        key: event._id.toString(),
                        val: event.toObject(),
                        ttl: 1800,
                    }));
                    myCache.mset(eventsToCache);
                }
                return res.status(200).json({
                    success: true,
                    events: events.length,
                    data: events,
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
exports.getSingleEvent = async (req, res, next) => {
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
                let event = await Event_1.default.findOne({
                    $and: [
                        { _id: req.params.id },
                        { "organizer.organizerId": authData.user._id },
                    ],
                });
                if (!event) {
                    return res.status(404).json({
                        success: false,
                        message: "No Event Found.",
                    });
                }
                return res.status(200).json({
                    success: true,
                    data: event,
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
exports.getEventApplicants = async (req, res, next) => {
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
            if (authData.user.role !== "organizer") {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden - You can't do that!",
                });
            }
            try {
                let event = await Event_1.default.findOne({
                    $and: [
                        { _id: req.params.id },
                        { "organizer.organizerId": authData.user._id },
                    ],
                });
                if (!event) {
                    return res.status(404).json({
                        success: false,
                        error: "No event found or you do not have permission to view applicants for this event",
                    });
                }
                return res.status(200).json({
                    success: true,
                    data: event.applicants,
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
exports.setReminder = async (req, res, next) => {
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
                const { reminderTime } = req.body;
                if (authData.user.role !== "organizer") {
                    return res.status(403).json({
                        success: false,
                        error: "Forbidden - You can't do that!",
                    });
                }
                let event = await Event_1.default.findOne({
                    $and: [
                        { _id: req.params.id },
                        { "organizer.organizerId": authData.user._id },
                    ],
                });
                if (!event) {
                    return res.status(404).json({
                        success: false,
                        message: "No Event Found.",
                    });
                }
                event.reminders.push({ reminderTime, email: authData.user.email });
                await event.save();
                res.status(201).json({ message: "Reminder set successfully" });
            }
            catch (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error setting reminder",
                    error: err.message,
                });
            }
        }
    });
};
