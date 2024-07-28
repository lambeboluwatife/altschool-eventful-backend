// import cron from "node-cron";
// import Event, { IEvent } from "./models/Event";
// import { sendReminder } from "./utils/sendReminders"; // Import your function to send reminders

// // Function to check events and send reminders
// const checkEventsForReminders = async () => {
//   const now = new Date();
//   const upcomingEvents = await Event.find({
//     reminderTime: { $lte: now },
//     sent: false,
//   });

//   for (const event of upcomingEvents) {
//     // Logic to send reminder
//     await sendReminder(event: IEvent);

//     // Mark the reminder as sent
//     event.sent = true;
//     await event.save();
//   }
// };

// // Schedule the job to run every minute
// cron.schedule("* * * * *", () => {
//   console.log("Running a task every minute");
//   checkEventsForReminders();
// });
