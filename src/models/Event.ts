import mongoose, { Schema, Document } from "mongoose";
import { ITicket } from "./Ticket";

interface IAuthor {
  [x: string]: any;
  organizerId: Schema.Types.ObjectId;
  organizationName: string;
  email: string;
}

interface IReminder {
  push(arg0: { reminderTime: string; email: string }): unknown;
  reminderTime: string;
  sent: boolean;
  email: string;
}

interface IApplicant {
  length: number;
  push(arg0: {
    applicantId: any;
    name: any;
    username: any;
    email: string;
  }): unknown;
  some(arg0: (applicant: IApplicant) => boolean): unknown;
  applicantId: Schema.Types.ObjectId;
  name: string;
  username: string;
  email: string;
}

interface IEvent extends Document {
  title: string;
  location: string;
  category: string;
  description: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  backdrop: string;
  applicants: IApplicant;
  ticketsSold: number;
  tickets: ITicket;
  reminders: IReminder;
  createdAt: Date;
  organizer: IAuthor;
}

const reminderSchema = new Schema({
  reminderTime: { type: String, required: true },
  sent: { type: Boolean, default: false },
  email: { type: String, required: true },
});

const ticketSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  attendeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  purchaseDate: { type: Date, default: Date.now },
  qrCode: { type: String, required: true },
  token: { type: String, required: true },
  used: { type: Boolean, default: false },
  price: { type: Number, required: true },
});

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, "Please enter event title"],
    trim: true,
  },
  location: {
    type: String,
    required: [true, "Please enter event location"],
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
  capacity: {
    type: Number,
    required: [true, "Please enter event capacity"],
  },
  backdrop: {
    type: String,
    required: [true, "Please enter event backdrop"],
  },
  applicants: [
    {
      applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      username: String,
      email: String,
    },
  ],
  ticketsSold: { type: Number, default: 0 },
  tickets: [ticketSchema],
  reminders: [reminderSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  organizer: {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
    },
    organizationName: String,
    email: String,
  },
});

const Event = mongoose.model<IEvent>("Event", eventSchema);

export default Event;
export { IEvent, IAuthor, IApplicant, IReminder };
