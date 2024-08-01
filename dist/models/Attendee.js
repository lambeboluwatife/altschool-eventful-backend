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
const attendeeSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    appliedEvents: [
        {
            eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Event" },
            title: { type: String },
            location: { type: String },
            category: { type: String },
            description: { type: String },
            date: { type: String },
            time: { type: String },
            price: { type: Number },
            capacity: { type: Number },
            backdrop: { type: String },
        },
    ],
    reminders: [
        {
            eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Event" },
            reminderTime: { type: String, required: true },
            sent: { type: Boolean, default: false },
            email: { type: String, required: true },
        },
    ],
    tickets: [
        {
            eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Event", required: true },
            attendeeId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
            purchaseDate: { type: Date, default: Date.now },
            qrCode: { type: String, required: true },
            used: { type: Boolean, default: false },
            price: { type: Number, required: true },
        },
    ],
});
const Attendee = mongoose_1.default.model("Attendee", attendeeSchema);
exports.default = Attendee;
