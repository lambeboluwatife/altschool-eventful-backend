"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../models/Event"));
const User_1 = __importDefault(require("../models/User"));
const Organizer_1 = __importDefault(require("../models/Organizer"));
const cloudinaryConfig_1 = require("../config/cloudinaryConfig");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const node_cache_1 = __importDefault(require("node-cache"));
const myCache = new node_cache_1.default();
exports.getSingleEvent = async (req, res, next) => {
    const eventId = req.params.id;
    try {
        const cachedEvent = myCache.get(eventId);
        if (cachedEvent) {
            return res.status(200).json({
                success: true,
                data: cachedEvent,
            });
        }
        const event = await Event_1.default.findOne({ _id: eventId }).exec();
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "No Event Found.",
            });
        }
        const key = event._id.toString();
        const val = event.toObject();
        const ttl = 1800;
        myCache.set(key, val, ttl);
        return res.status(200).json({
            success: true,
            data: val,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};
exports.getEvents = async (req, res, next) => {
    try {
        const eventKeys = myCache.keys().filter((key) => key.startsWith("event-"));
        const cachedEvents = myCache.mget(eventKeys);
        if (Object.keys(cachedEvents).length > 0) {
            return res.status(200).json({
                success: true,
                count: Object.keys(cachedEvents).length,
                data: Object.values(cachedEvents),
            });
        }
        const events = (await Event_1.default.find());
        if (events.length > 0) {
            const eventsToCache = events.map((event) => ({
                key: `event-${event._id.toString()}`,
                val: event.toObject(),
                ttl: 1800,
            }));
            myCache.mset(eventsToCache);
        }
        return res.status(200).json({
            success: true,
            count: events.length,
            data: events,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};
exports.searchEvents = async (req, res, next) => {
    const { search } = req.body;
    const newSearch = new RegExp(search, "i");
    try {
        const events = await Event_1.default.find({
            $or: [
                { title: newSearch },
                { location: newSearch },
                { category: newSearch },
                { "organizer.organizationName": newSearch },
            ],
        });
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
exports.addEvent = async (req, res, next) => {
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
                const user = await User_1.default.findById(authData.user._id).exec();
                if (!user || user.role !== "organizer") {
                    return res.status(403).json({
                        message: "Access denied. Only organizers can perform this action.",
                    });
                }
                const organizer = await Organizer_1.default.findOne({
                    userId: authData.user._id,
                }).exec();
                if (!organizer) {
                    return res.status(404).json({
                        success: false,
                        message: "Organizer details not found",
                    });
                }
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: "No file uploaded",
                    });
                }
                const result = await cloudinaryConfig_1.cloudinary.uploader.upload(req.file.path);
                fs_1.default.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
                const { title, location, category, description, date, time, price, capacity, ticketsSold, reminders, createdAt, } = req.body;
                const reminder = {
                    reminderTime: reminders,
                    email: authData.user.email,
                };
                const newEvent = new Event_1.default({
                    title,
                    location,
                    category,
                    description,
                    date,
                    time,
                    price,
                    capacity,
                    backdrop: result.secure_url,
                    applicants: [],
                    ticketsSold,
                    tickets: [],
                    reminders: reminder,
                    createdAt,
                    organizer: {
                        organizerId: authData.user._id,
                        organizationName: organizer === null || organizer === void 0 ? void 0 : organizer.organizationName,
                        email: authData.user.email,
                    },
                });
                const event = await newEvent.save();
                await Organizer_1.default.findByIdAndUpdate(organizer, {
                    $push: { createdEvents: event },
                });
                return res.status(201).json({
                    success: true,
                    data: event,
                });
            }
            catch (err) {
                if (err.name === "ValidationError") {
                    const messages = Object.values(err.errors).map((val) => val.message);
                    return res.status(400).json({
                        success: false,
                        error: messages,
                    });
                }
                else {
                    return res.status(500).json({
                        success: false,
                        error: err.message,
                    });
                }
            }
        }
    });
};
// exports.updateEvent = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.token;
//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       error: "Unauthorized: Missing token",
//     });
//   }
//   jwt.verify(token, "secretkey", async (err, decoded) => {
//     if (err) {
//       return res.status(403).json({
//         success: false,
//         error: "Forbidden",
//       });
//     } else {
//       const authData = decoded as AuthData;
//       if (authData.user.role !== "organizer") {
//         return res.status(403).json({
//           success: false,
//           error: "Forbidden - You can't do that!",
//         });
//       }
//       try {
//         const eventId = req.params.id;
//         const updateData = req.body;
//         const event = await Event.findById(eventId);
//         console.log(event);
//         if (!event) {
//           return res.status(404).json({
//             success: false,
//             message: "No Event Found.",
//           });
//         }
//         console.log(updateData);
//         console.log(req.body);
//         await Event.findByIdAndUpdate(event, {
//           updateData,
//         });
//         return res.status(200).json({
//           success: true,
//           data: event,
//         });
//       } catch (err: any) {
//         return res.status(500).json({
//           success: false,
//           error: err.message,
//         });
//       }
//     }
//   });
// };
exports.deleteEvent = async (req, res, next) => {
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
                        error: "No event found",
                    });
                }
                await event.deleteOne();
                return res.status(200).json({
                    success: true,
                    data: {},
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
