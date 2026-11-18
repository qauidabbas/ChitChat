import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chat.js";
import { app, server } from "./config/socket.js";
import cors from "cors";
import path from "path";
connectDB();

app.use(express.json());
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000").split(",");
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use("/api/v1", chatRoutes);
const PORT=process.env.PORT;
server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})