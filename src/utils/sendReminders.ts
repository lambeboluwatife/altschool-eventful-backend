import dotenv from "dotenv";
import { IEvent, IReminder } from "../models/Event";
import nodemailer from "nodemailer";
dotenv.config({ path: "./src/config/config.env" });

export const sendReminder = async (reminder: IReminder, event: IEvent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: reminder.email,
    subject: "Event Reminder",
    text: `This is a reminder for your event: ${event.title}`,
  };

  console.log(mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
