"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const Event_1 = __importDefault(require("./models/Event"));
const sendReminders_1 = require("./utils/sendReminders");
const moment_1 = __importDefault(require("moment"));
const checkEventsForReminders = async () => {
    const today = new Date();
    const todayDate = (0, moment_1.default)(today).format("DD/MM/YYYY");
    const upcomingEvents = await Event_1.default.find({
        "reminders.reminderTime": todayDate,
        "reminders.sent": false,
    });
    for (const event of upcomingEvents) {
        if (Array.isArray(event.reminders)) {
            for (const reminder of event.reminders) {
                if (reminder.reminderTime <= todayDate && !reminder.sent) {
                    await (0, sendReminders_1.sendReminder)(reminder, event);
                    event.reminders.sent = true;
                    await event.save();
                }
            }
        }
    }
};
node_cron_1.default.schedule("0 7 * * *", () => {
    console.log("Running a task every minute");
    checkEventsForReminders();
});
