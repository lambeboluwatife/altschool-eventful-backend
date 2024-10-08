"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
// import bcrypt from "bcryptjs";
const bcrypt = require("bcryptjs");
const User_1 = __importDefault(require("../models/User"));
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
}, async (email, password, done) => {
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return done(null, false, { message: "Incorrect email or password." });
        }
        // Match Password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(null, user);
            }
            else {
                return done(null, false, {
                    message: "Incorrect email or password.",
                });
            }
        });
    }
    catch (error) {
        return done(error);
    }
}));
// Serialize user instance to session
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
// Deserialize user instance from session
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = (await User_1.default.findById(id));
        done(null, user);
    }
    catch (error) {
        done(error);
    }
});
exports.default = passport_1.default;
