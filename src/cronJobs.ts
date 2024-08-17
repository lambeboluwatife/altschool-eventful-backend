import cron from "node-cron";
import Event from "./models/Event";
import { sendReminderEmails } from "./utils/sendEmails";
import moment from "moment";

const checkEventsForReminders = async () => {
  const today = new Date();
  const todayDate = moment(today).format("DD/MM/YYYY");
  const upcomingEvents = await Event.find({
    "reminders.reminderTime": todayDate,
    "reminders.sent": false,
  });

  for (const event of upcomingEvents) {
    if (Array.isArray(event.reminders)) {
      for (const reminder of event.reminders) {
        if (reminder.reminderTime <= todayDate && !reminder.sent) {
          await sendReminderEmails(reminder, event);

          event.reminders.sent = true;
          await event.save();
        }
      }
    }
  }
};

cron.schedule("0 7 * * *", () => {
  console.log("Running a task every minute");
  checkEventsForReminders();
});
