"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../models/Event"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Attendee_1 = __importDefault(require("../models/Attendee"));
exports.getEvents = async (req, res, next) => {
    try {
        const events = await Event_1.default.find();
        return res.status(200).json({
            success: true,
            count: events.length,
            data: events.length === 0 ? "No Events" : events,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};
exports.applyToEvent = async (req, res, next) => {
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
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: "No event found",
                });
            }
            const attendee = await Attendee_1.default.findOne({
                userId: authData.user._id,
            }).exec();
            if (!attendee) {
                return res.status(404).json({
                    success: false,
                    message: "Attendee details not found",
                });
            }
            const alreadyApplied = event.applicants.some((applicant) => applicant.applicantId.toString() === authData.user._id.toString());
            if (alreadyApplied) {
                return res.status(405).json({
                    success: false,
                    error: "Already applied.",
                });
            }
            if (event.organizer.organizerId.toString() === authData.user._id.toString()) {
                return res.status(405).json({
                    success: false,
                    error: "You can't apply for your own event.",
                });
            }
            event.applicants.push({
                applicantId: authData.user._id,
                name: authData.user.name,
                username: authData.user.username,
                email: authData.user.email,
            });
            await event.save();
            await Attendee_1.default.findByIdAndUpdate(attendee, {
                $push: { appliedEvents: event },
            });
            return res.status(200).json({
                success: true,
                message: "Applied for event successfully",
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
exports.appliedEvent = async (req, res, next) => {
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
                let event = await Event_1.default.findOne({
                    "applicants.applicantId": authData.user._id,
                });
                if (!event) {
                    return res.status(404).json({
                        success: false,
                        error: "No event found",
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
                const eventId = req.params.id;
                const { reminderTime } = req.body;
                let attendee = await Attendee_1.default.findOne({
                    userId: authData.user._id,
                });
                let event = await Event_1.default.findOne({
                    _id: eventId,
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
                        message: "No Event Found.",
                    });
                }
                attendee.reminders.push({
                    eventId,
                    reminderTime,
                    email: authData.user.email,
                });
                await attendee.save();
                event.reminders.push({
                    reminderTime,
                    email: authData.user.email,
                });
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
