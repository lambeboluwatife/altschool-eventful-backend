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
exports.logoutUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const Organizer_1 = __importDefault(require("../models/Organizer"));
const Attendee_1 = __importDefault(require("../models/Attendee"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_1 = __importDefault(require("passport"));
exports.registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, username, email, role, organizationName, password, verifyPassword, } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                error: "Enter name",
            });
        }
        if (!username) {
            return res.status(400).json({
                success: false,
                error: "Enter username",
            });
        }
        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Enter email",
            });
        }
        if (!role) {
            return res.status(400).json({
                success: false,
                error: "Enter role",
            });
        }
        if (!password) {
            return res.status(400).json({
                success: false,
                error: "Enter password",
            });
        }
        if (!verifyPassword) {
            return res.status(400).json({
                success: false,
                error: "Enter verify password",
            });
        }
        if (role === "organizer" && !organizationName) {
            return res.status(400).json({
                message: "Organization name is required for organizers",
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password should be a least 6 characters",
            });
        }
        if (password !== verifyPassword) {
            return res.status(400).json({
                success: false,
                error: "Passwords do not match",
            });
        }
        User_1.default.findOne({ email: email }).then((user) => {
            if (user) {
                return res.status(409).json({
                    success: false,
                    error: "Email address already exist. Please use a different email.",
                });
            }
            else {
                const newUser = new User_1.default({
                    name,
                    username,
                    email,
                    role,
                    password,
                });
                // Mash Password
                bcryptjs_1.default.genSalt(10, (err, salt) => bcryptjs_1.default.hash(newUser.password, salt, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
                    if (err)
                        throw err;
                    // Set password to hashed
                    newUser.password = hash;
                    // Save user
                    const savedUser = yield newUser.save();
                    if (role === "organizer") {
                        // Create the organizer entry
                        const newOrganizer = new Organizer_1.default({
                            userId: savedUser._id,
                            organizationName,
                            createdEvents: [],
                        });
                        const savedOrganizer = yield newOrganizer.save();
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
                        const savedAttendee = yield newAttendee.save();
                        res.status(201).json({
                            message: "Attendee registered successfully",
                            userId: savedUser._id,
                            attendeeId: savedAttendee._id,
                        });
                    }
                })));
            }
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
});
exports.loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
});
const logoutUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});
exports.logoutUser = logoutUser;
