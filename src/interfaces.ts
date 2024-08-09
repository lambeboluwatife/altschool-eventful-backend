import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IAppliedEvents {
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

export interface IReminder {
  push(arg0: { eventId: string; reminderTime: string; email: string }): unknown;
  eventId: Schema.Types.ObjectId;
  reminderTime: string;
  sent: boolean;
}

export interface IAttendee extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName: string;
  appliedEvents: IAppliedEvents;
  reminders: IReminder;
  tickets: ITicket;
}

export interface IAuthor {
  [x: string]: any;
  organizerId: Schema.Types.ObjectId;
  organizationName: string;
  email: string;
}

export interface IReminder {
  push(arg0: { reminderTime: string; email: string }): unknown;
  reminderTime: string;
  sent: boolean;
  email: string;
}

export interface IApplicant {
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

export interface IEvent extends Document {
  _id: ObjectId;
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

export interface ICreatedEvents {
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

export interface IOrganizer extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName: string;
  createdEvents: ICreatedEvents;
}

export interface ITicket extends Document {
  filter(arg0: (ticket: { scanned: any }) => any): number;
  find(arg0: (event: ITicket) => boolean): ITicket | undefined;
  push(arg0: {
    eventId: string;
    attendeeId: string;
    qrCode: string;
    token: string;
    price: number;
  }): unknown;
  eventId: string;
  attendeeId: string;
  purchaseDate: Date;
  qrCode: string;
  token: string;
  scanned: boolean;
  price: number;
}

export interface IUser extends Document {
  id?: string;
  name: string;
  username: string;
  email: string;
  role: string;
  password: string;
  createdAt: Date;
}
