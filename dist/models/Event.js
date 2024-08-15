"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const reminderSchema = new mongoose_1.Schema({
    reminderTime: { type: String, required: true },
    sent: { type: Boolean, default: false },
    email: { type: String, required: true },
});
const ticketSchema = new mongoose_1.Schema({
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Event", required: true },
    attendeeId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    purchaseDate: { type: Date, default: Date.now },
    qrCode: { type: String, required: true },
    token: { type: String, required: true },
    used: { type: Boolean, default: false },
    price: { type: Number, required: true },
});
const eventSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Please enter event title"],
        trim: true,
    },
    location: {
        type: String,
        required: [true, "Please enter event location"],
    },
    category: {
        type: String,
        required: [true, "Please enter event category"],
    },
    description: {
        type: String,
        required: [true, "Please enter event description"],
    },
    date: {
        type: Date,
        required: [true, "Please enter event date"],
    },
    time: {
        type: String,
        required: [true, "Please enter event start time"],
    },
    price: {
        type: Number,
        required: [true, "Please enter ticket price"],
    },
    capacity: {
        type: Number,
        required: [true, "Please enter event capacity"],
    },
    backdrop: {
        type: String,
        required: [true, "Please enter event backdrop"],
    },
    applicants: [
        {
            applicantId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
            name: String,
            username: String,
            email: String,
        },
    ],
    ticketsSold: { type: Number, default: 0 },
    tickets: [ticketSchema],
    reminders: [reminderSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    organizer: {
        organizerId: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Organizer",
        },
        organizationName: String,
        email: String,
    },
});
const Event = mongoose_1.default.model("Event", eventSchema);
exports.default = Event;
