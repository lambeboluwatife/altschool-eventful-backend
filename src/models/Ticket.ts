import mongoose, { Document, Schema } from "mongoose";

interface ITicket extends Document {
  push(arg0: {
    eventId: unknown;
    attendeeId: any;
    qrCode: string;
    token: string;
    price: number;
  }): unknown;
  eventId: string;
  attendeeId: string;
  purchaseDate: Date;
  qrCode: string;
  token: string;
  used: boolean;
  price: number;
}

const TicketSchema: Schema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  attendeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  purchaseDate: { type: Date, default: Date.now },
  qrCode: { type: String, required: true },
  token: { type: String, required: true },
  used: { type: Boolean, default: false },
  price: { type: Number, required: true },
});

const Ticket = mongoose.model<ITicket>("Ticket", TicketSchema);
export default Ticket;
export { ITicket };
