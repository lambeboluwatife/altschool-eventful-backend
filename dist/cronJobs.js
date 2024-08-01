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
const checkEventsForReminders = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const todayDate = (0, moment_1.default)(today).format("DD/MM/YYYY");
    const upcomingEvents = yield Event_1.default.find({
        "reminders.reminderTime": todayDate,
        "reminders.sent": false,
    });
    for (const event of upcomingEvents) {
        if (Array.isArray(event.reminders)) {
            for (const reminder of event.reminders) {
                if (reminder.reminderTime <= todayDate && !reminder.sent) {
                    yield (0, sendReminders_1.sendReminder)(reminder, event);
                    event.reminders.sent = true;
                    yield event.save();
                }
            }
        }
    }
});
node_cron_1.default.schedule("0 7 * * *", () => {
    console.log("Running a task every minute");
    checkEventsForReminders();
});
