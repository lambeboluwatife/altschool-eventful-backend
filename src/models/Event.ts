import mongoose, { Schema, Document } from "mongoose";

interface IAuthor {
  _id: string;
  name: string;
  email: string;
}

interface IEvent extends Document {
  name: string;
  venue: string;
  category: string;
  description: string;
  date: Date;
  time: string;
  price: string;
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
    type: Date,
    required: [true, "Please enter event date"],
  },
  time: {
    type: String,
    required: [true, "Please enter event start time"],
  },
  price: {
    type: String,
    required: [true, "Please enter ticket price"],
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
