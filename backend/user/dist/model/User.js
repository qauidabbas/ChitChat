import mongoose, { Schema, Document } from "mongoose";
const schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });
export const User = mongoose.model("User", schema);
//# sourceMappingURL=User.js.map