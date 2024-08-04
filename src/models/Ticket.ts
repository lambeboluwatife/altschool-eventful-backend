import mongoose, { Document, Schema } from "mongoose";

interface ITicket extends Document {
  filter(arg0: (ticket: { scanned: any; }) => any): number;
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

const TicketSchema: Schema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  attendeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  purchaseDate: { type: Date, default: Date.now },
  qrCode: { type: String, required: true },
  token: { type: String, required: true },
  scanned: { type: Boolean, default: false },
  price: { type: Number, required: true },
});

const Ticket = mongoose.model<ITicket>("Ticket", TicketSchema);
export default Ticket;
export { ITicket };
