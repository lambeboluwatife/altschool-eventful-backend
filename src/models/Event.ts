import mongoose, { Schema, Document } from "mongoose";

interface IAuthor {
  [x: string]: any;
  organizerId: Schema.Types.ObjectId;
  organizationName: string;
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
  createdAt: Date;
  organizer: IAuthor;
}

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
export { IEvent, IAuthor };
