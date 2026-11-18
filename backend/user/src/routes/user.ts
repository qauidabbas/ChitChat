import express from "express";
import { myProfile, searchByUsername, sendRequest, acceptRequest, rejectRequest, getContacts, getPendingRequests, registerInit, registerVerify, loginUser, resendSignupOTP, getAUser, updateName, getAllUsers } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";
const router = express.Router();
router.post("/register-init", registerInit);
router.post("/register-verify", registerVerify);
router.post("/login", loginUser);
router.post("/resend-signup-otp", resendSignupOTP);
router.get("/me", isAuth, myProfile);
router.get("/user/all", isAuth, getAllUsers);
router.get("/user/:id",getAUser);
router.post("/update/user", isAuth,updateName);

// New Contact & Request Routes
router.get("/search/username/:username", isAuth, searchByUsername);
router.post("/request/send", isAuth, sendRequest);
router.post("/request/accept", isAuth, acceptRequest);
router.post("/request/reject", isAuth, rejectRequest);
router.get("/contacts", isAuth, getContacts);
router.get("/requests/pending", isAuth, getPendingRequests);

export default router;