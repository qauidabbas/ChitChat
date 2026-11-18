import express from "express"
import { createNewChat,getAllChats, getMessagesForChat, sendMessage } from "../controllers/chat.js";
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";

const router=express.Router();
router.post("/chat/new", isAuth, createNewChat);
router.get("/chat/all", isAuth, getAllChats);
router.post("/message", isAuth, (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            console.error("Multer Upload Error:", err);
            return res.status(400).json({ message: err.message || "File upload failed" });
        }
        next();
    });
}, sendMessage);
router.get("/message/:chatId", isAuth, getMessagesForChat);
export default router;