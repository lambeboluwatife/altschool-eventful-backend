import mongoose, { Schema, Document } from "mongoose";

interface IAuthor {
  _id: string;
  name: string;
  email: string;
}

interface IEvent extends Document {
  name: string;
  organizer?: string;
  venue: string;
  category: string;
  description: string;
  date: string;
  time: string;
  price: number;
  ticket: number;
  backdrop: string;
  createdAt: Date;
  author: IAuthor;
}

const eventSchema = new Schema<IEvent>({
  name: {
    type: String,
    required: [true, "Please enter event name"],
    trim: true,
  },
  organizer: { type: String },
  venue: {
    type: String,
    required: [true, "Please enter event venue"],
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
  ticket: {
    type: Number,
    required: [true, "Please enter available ticket"],
  },
  backdrop: {
    type: String,
    required: [true, "Please enter event backdrop"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    email: String,
  },
});

const Event = mongoose.model<IEvent>("Event", eventSchema);

export default Event;
export { IEvent, IAuthor };
