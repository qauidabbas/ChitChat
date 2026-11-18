import mongoose, { Schema, Document } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    username: string;
    password?: string;
    contacts: mongoose.Types.ObjectId[];
    pendingRequests: mongoose.Types.ObjectId[];
}
const schema: Schema<IUser> = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
},{ timestamps: true });

export const User = mongoose.model<IUser>("User", schema);