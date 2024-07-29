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
const node_cron_1 = __importDefault(require("node-cron"));
const Event_1 = __importDefault(require("./models/Event"));
const sendReminders_1 = require("./utils/sendReminders");
const moment_1 = __importDefault(require("moment"));
// Function to check events and send reminders
const checkEventsForReminders = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const upcomingEvents = yield Event_1.default.find({
        reminderTime: { $lte: (0, moment_1.default)(today).format("DD/MM/YYYY") },
        sent: false,
    });
    for (const event of upcomingEvents) {
        const eventToSend = event;
        console.log(eventToSend);
        yield (0, sendReminders_1.sendReminder)(eventToSend);
        event.reminders.sent = true;
        yield event.save();
    }
});
node_cron_1.default.schedule("* * * * *", () => {
    console.log("Running a task every minute");
    checkEventsForReminders();
});
