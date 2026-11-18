import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";
dotenv.config();
connectDB();
connectRabbitMQ(); // Call the function to connect to RabbitMQ
if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not defined");
}
export const redisClient = createClient({
    url: process.env.REDIS_URL,
});
redisClient.connect().then(() => {
    console.log("Redis connected successfully");
}).catch((err) => {
    console.error("Error connecting to Redis:", err);
    process.exit(1);
});
const app = express();
app.use(express.json());
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000").split(",");
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use("/api/v1", userRoutes);
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map