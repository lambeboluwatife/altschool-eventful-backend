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
const Event_1 = __importDefault(require("../models/Event"));
const User_1 = __importDefault(require("../models/User"));
const Organizer_1 = __importDefault(require("../models/Organizer"));
const cloudinaryConfig_1 = require("../config/cloudinaryConfig");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
exports.addEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                const user = yield User_1.default.findById(authData.user._id).exec();
                if (!user || user.role !== "organizer") {
                    return res.status(403).json({
                        message: "Access denied. Only organizers can perform this action.",
                    });
                }
                const organizer = yield Organizer_1.default.findOne({
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
                const result = yield cloudinaryConfig_1.cloudinary.uploader.upload(req.file.path);
                fs_1.default.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
                const { title, location, category, description, date, time, price, capacity, applicants, ticketsSold, reminders, createdAt, } = req.body;
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
                    reminders: reminder,
                    createdAt,
                    organizer: {
                        organizerId: authData.user._id,
                        organizationName: organizer === null || organizer === void 0 ? void 0 : organizer.organizationName,
                        email: authData.user.email,
                    },
                });
                const event = yield newEvent.save();
                yield Organizer_1.default.findByIdAndUpdate(organizer, {
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
    }));
});
exports.getCreatedEvents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            const organizerId = authData.user._id;
            try {
                if (authData.user.role !== "organizer") {
                    return res.status(403).json({
                        success: false,
                        error: "Forbidden - You can't do that!",
                    });
                }
                const event = yield Event_1.default.find({
                    "organizer.organizerId": organizerId,
                }).exec();
                return res.status(200).json({
                    success: true,
                    events: event.length,
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
    }));
});
exports.getSingleEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                let event = yield Event_1.default.findOne({
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
    }));
});
exports.getEventApplicants = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            if (authData.user.role !== "organizer") {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden - You can't do that!",
                });
            }
            try {
                let event = yield Event_1.default.findOne({
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
    }));
});
exports.setReminder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
                const { reminderTime } = req.body;
                if (authData.user.role !== "organizer") {
                    return res.status(403).json({
                        success: false,
                        error: "Forbidden - You can't do that!",
                    });
                }
                let event = yield Event_1.default.findOne({
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
                yield event.save();
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
    }));
});
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
exports.deleteEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            if (authData.user.role !== "organizer") {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden - You can't do that!",
                });
            }
            try {
                let event = yield Event_1.default.findOne({
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
                yield event.deleteOne();
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
    }));
});
