import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  id?: string;
  name: string;
  username: string;
  email: string;
  role: string;
  password: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
  },
  username: {
    type: String,
    required: [true, "Please enter your username"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    trim: true,
  },
  role: {
    type: String,
    required: [true, "Please enter role"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
export { IUser };
