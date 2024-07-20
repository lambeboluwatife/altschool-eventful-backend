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
const eventSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please enter event name"],
        trim: true,
    },
    organizer: { type: String },
    venue: {
        type: String,
        required: [true, "Please enter event venue"],
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
        type: String,
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
    ticket: {
        type: Number,
        required: [true, "Please enter available ticket"],
    },
    backdrop: {
        type: String,
        required: [true, "Please enter event backdrop"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    author: {
        id: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        },
        name: String,
        email: String,
    },
});
const Event = mongoose_1.default.model("Event", eventSchema);
exports.default = Event;
