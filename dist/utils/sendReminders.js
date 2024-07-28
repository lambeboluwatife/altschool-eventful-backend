"use strict";
// import { Document } from 'mongoose';
// import Event, { IEvent } from '../models/Event'; // Import the Event model
// import nodemailer from 'nodemailer'; // Import nodemailer or any other mailer library
Object.defineProperty(exports, "__esModule", { value: true });
// export const sendReminder = async (event: Document<unknown, {}, IEvent> & IEvent & Required<{ _id: unknown; }>, event: Event) => {
//   // Logic to send email or notification
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'your-email@gmail.com',
//       pass: 'your-email-password',
//     },
//   });
//   const mailOptions = {
//     from: 'your-email@gmail.com',
//     to: event.organizer.email, // Assuming the organizer's email is stored in the event
//     subject: 'Event Reminder',
//     text: `This is a reminder for your event: ${event.name}`,
//   };
//   await transporter.sendMail(mailOptions);
// };
