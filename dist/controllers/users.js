"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const Organizer_1 = __importDefault(require("../models/Organizer"));
const Attendee_1 = __importDefault(require("../models/Attendee"));
const validationSchema_1 = require("../utils/validationSchema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_1 = __importDefault(require("passport"));
const sendEmails_1 = require("../utils/sendEmails");
exports.registerUser = async (req, res, next) => {
    try {
        const validInputs = await validationSchema_1.authSchema.validateAsync(req.body);
        if (validInputs.role === "organizer" && !validInputs.organizationName) {
            return res.status(400).json({
                message: "Organization name is required for organizers",
            });
        }
        User_1.default.findOne({ email: validInputs.email }).then((user) => {
            if (user) {
                return res.status(409).json({
                    success: false,
                    error: "Email address already exist. Please use a different email.",
                });
            }
            else {
                const newUser = new User_1.default(validInputs);
                // Mash Password
                bcryptjs_1.default.genSalt(10, (err, salt) => bcryptjs_1.default.hash(newUser.password, salt, async (err, hash) => {
                    if (err)
                        throw err;
                    // Set password to hashed
                    newUser.password = hash;
                    // Save user
                    const savedUser = await newUser.save();
                    if (validInputs.role === "organizer") {
                        // Create the organizer entry
                        const newOrganizer = new Organizer_1.default({
                            userId: savedUser._id,
                            organizationName: validInputs.organizationName,
                            createdEvents: [],
                        });
                        const savedOrganizer = await newOrganizer.save();
                        res.status(201).json({
                            message: "Organizer registered successfully",
                            userId: savedUser._id,
                            organizerId: savedOrganizer._id,
                        });
                    }
                    else {
                        // Create the attendee entry
                        const newAttendee = new Attendee_1.default({
                            userId: savedUser._id,
                            appliedEvents: [],
                        });
                        const savedAttendee = await newAttendee.save();
                        res.status(201).json({
                            message: "Attendee registered successfully",
                            userId: savedUser._id,
                            attendeeId: savedAttendee._id,
                        });
                    }
                    (0, sendEmails_1.sendWelcomeEmail)(savedUser);
                }));
            }
        });
    }
    catch (error) {
        if (error.isJoi) {
            const errorMessage = error.details[0].message;
            return res.status(400).json({
                success: false,
                error: errorMessage,
            });
        }
        else {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
};
exports.loginUser = async (req, res, next) => {
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message,
            });
        }
        if (!user) {
            return res.status(401).json({
                success: false,
                message: info.message,
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message,
                });
            }
            next();
        });
    })(req, res, next);
};
const logoutUser = async (req, res, next) => {
    res.clearCookie("token");
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
};
exports.logoutUser = logoutUser;
