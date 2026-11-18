import mongoose from "mongoose";
import dotenv from "dotenv";
const connectDB = async () => {
    const url = process.env.MONGO_URI;
    if (!url) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }
    try {
        await mongoose.connect(url, {
            dbName: "ChitChat"
        });
        console.log("MongoDB connected successfully");
    }
    catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
};
export default connectDB;
//# sourceMappingURL=db.js.map