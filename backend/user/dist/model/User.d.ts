import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    username: string;
    password?: string;
    contacts: mongoose.Types.ObjectId[];
    pendingRequests: mongoose.Types.ObjectId[];
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=User.d.ts.map