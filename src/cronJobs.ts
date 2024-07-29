import cron from "node-cron";
import Event, { IEvent } from "./models/Event";
import { sendReminder } from "./utils/sendReminders";
import moment from "moment";

// Function to check events and send reminders
const checkEventsForReminders = async () => {
  const today = new Date();
  const upcomingEvents = await Event.find({
    reminderTime: { $lte: moment(today).format("DD/MM/YYYY") },
    sent: false,
  });

  for (const event of upcomingEvents) {
    const eventToSend = event as IEvent;
    console.log(eventToSend);
    await sendReminder(eventToSend);

    event.reminders.sent = true;
    await event.save();
  }
};

cron.schedule("* * * * *", () => {
  console.log("Running a task every minute");
  checkEventsForReminders();
});
