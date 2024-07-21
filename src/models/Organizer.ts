import mongoose, { Schema, Document } from "mongoose";

interface ICreatedEvents {
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

interface IOrganizer extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName: string;
  createdEvents: ICreatedEvents;
}

const organizerSchema = new Schema<IOrganizer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organizationName: {
    type: String,
    required: [true, "Please enter role"],
    trim: true,
  },
  createdEvents: [
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
});

const Organizer = mongoose.model<IOrganizer>("Organizer", organizerSchema);

export default Organizer;
export { IOrganizer, ICreatedEvents };
