import mongoose, { Schema, Document } from "mongoose";
import { ITicket } from "./Ticket";

interface IAppliedEvents {
  eventId: Schema.Types.ObjectId;
  title: string;
  location: string;
  category: string;
  description: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  backdrop: string;
}

interface IReminder {
  push(arg0: { eventId: string; reminderTime: string; email: string }): unknown;
  eventId: Schema.Types.ObjectId;
  reminderTime: string;
  sent: boolean;
}

interface IAttendee extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName: string;
  appliedEvents: IAppliedEvents;
  reminders: IReminder;
  tickets: ITicket;
}

const attendeeSchema = new Schema<IAttendee>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  appliedEvents: [
    {
      eventId: { type: Schema.Types.ObjectId, ref: "Event" },
      title: { type: String },
      location: { type: String },
      category: { type: String },
      description: { type: String },
      date: { type: String },
      time: { type: String },
      price: { type: Number },
      capacity: { type: Number },
      backdrop: { type: String },
    },
  ],
  reminders: [
    {
      eventId: { type: Schema.Types.ObjectId, ref: "Event" },
      reminderTime: { type: String, required: true },
      sent: { type: Boolean, default: false },
      email: { type: String, required: true },
    },
  ],
  tickets: [
    {
      eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
      attendeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      purchaseDate: { type: Date, default: Date.now },
      qrCode: { type: String, required: true },
      used: { type: Boolean, default: false },
      price: { type: Number, required: true },
    },
  ],
});

const Attendee = mongoose.model<IAttendee>("Attendee", attendeeSchema);

export default Attendee;
export { IAttendee, IAppliedEvents };
