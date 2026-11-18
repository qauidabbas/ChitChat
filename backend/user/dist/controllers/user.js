import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { publishToQueue } from "../config/rabbitmq.js";
import { User } from "../model/User.js";
import { generateToken } from "../config/generateToken.js";
import bcrypt from "bcryptjs";
export const registerInit = TryCatch(async (req, res) => {
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password) {
        res.status(400).json({ message: "Please enter all fields" });
        return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        res.status(400).json({ message: "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character." });
        return;
    }
    const userExists = await User.findOne({ $or: [{ email }, { username: username.toLowerCase() }] });
    if (userExists) {
        res.status(400).json({ message: "User already exists with this email or username" });
        return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const pendingUser = { name, email, username: username.toLowerCase(), password: hashedPassword };
    await redisClient.set(`pending_user:${email}`, JSON.stringify(pendingUser), { EX: 600 });
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
        res.status(429).json({ message: "Too many requests. Please try again later." });
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`otp:${email}`, otp, { EX: 600 });
    await redisClient.set(rateLimitKey, "true", { EX: 60 });
    const message = { to: email, subject: "Your ChitChat Verification Code", body: `Your OTP code is ${otp}. It will expire in 10 minutes.` };
    await publishToQueue("send-otp", message);
    res.json({ message: "Verification code sent to your email. Please verify." });
});
export const registerVerify = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;
    if (!email || !enteredOtp)
        return res.status(400).json({ message: "Email and OTP Required" });
    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp || storedOtp !== enteredOtp)
        return res.status(400).json({ message: "Invalid or expired OTP" });
    const pendingUserStr = await redisClient.get(`pending_user:${email}`);
    if (!pendingUserStr)
        return res.status(400).json({ message: "Registration session expired. Please sign up again." });
    const pendingUser = JSON.parse(pendingUserStr);
    const userExists = await User.findOne({ $or: [{ email }, { username: pendingUser.username }] });
    if (userExists) {
        res.status(400).json({ message: "User already exists with this email or username" });
        return;
    }
    const user = await User.create(pendingUser);
    await redisClient.del(otpKey);
    await redisClient.del(`pending_user:${email}`);
    const token = generateToken(user);
    delete user.password;
    res.json({ message: "Account verified and created successfully", user, token });
});
export const loginUser = TryCatch(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Please enter all fields" });
        return;
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
    }
    if (!user.password) {
        res.status(400).json({ message: "Legacy account. Please delete and create a new account." });
        return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
    }
    const token = generateToken(user);
    delete user.password;
    res.json({ message: "Logged in successfully", user, token });
});
export const resendSignupOTP = TryCatch(async (req, res) => {
    const { email } = req.body;
    const pendingUserStr = await redisClient.get(`pending_user:${email}`);
    if (!pendingUserStr)
        return res.status(400).json({ message: "Registration session expired. Please sign up again." });
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
        res.status(429).json({ message: "Too many requests. Please try again later." });
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`otp:${email}`, otp, { EX: 600 });
    await redisClient.set(rateLimitKey, "true", { EX: 60 });
    const message = { to: email, subject: "Your ChitChat Verification Code", body: `Your OTP code is ${otp}. It will expire in 10 minutes.` };
    await publishToQueue("send-otp", message);
    res.json({ message: "Verification code resent to your email." });
});
export const myProfile = TryCatch(async (req, res) => {
    const user = req.user;
    res.json(user);
});
export const updateName = TryCatch(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        res.status(404).json({
            message: "Please Login",
        });
        return;
    }
    user.name = req.body.name;
    await user.save();
    const token = generateToken(user);
    res.json({
        message: "User updated",
        user,
        token,
    });
});
export const getAllUsers = TryCatch(async (req, res) => {
    const users = await User.find();
    res.json(users);
});
export const getAUser = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});
export const searchByUsername = TryCatch(async (req, res) => {
    const username = req.params.username;
    const user = await User.findOne({ username: username.toLowerCase() }).select("-email -contacts -pendingRequests");
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json(user);
});
export const sendRequest = TryCatch(async (req, res) => {
    const senderId = req.user?._id;
    if (!senderId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { targetId } = req.body;
    if (senderId.toString() === targetId) {
        res.status(400).json({ message: "You cannot send a request to yourself" });
        return;
    }
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
        res.status(404).json({ message: "Target user not found" });
        return;
    }
    // Check if already contacts
    if (targetUser.contacts.includes(senderId)) {
        res.status(400).json({ message: "Already in contacts" });
        return;
    }
    // Check if request already sent
    if (targetUser.pendingRequests.includes(senderId)) {
        res.status(400).json({ message: "Request already sent" });
        return;
    }
    targetUser.pendingRequests.push(senderId);
    await targetUser.save();
    res.json({ message: "Request sent successfully" });
});
export const acceptRequest = TryCatch(async (req, res) => {
    const myId = req.user?._id;
    if (!myId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { senderId } = req.body;
    const me = await User.findById(myId);
    if (!me || !me.pendingRequests.includes(senderId)) {
        res.status(400).json({ message: "No pending request from this user" });
        return;
    }
    const sender = await User.findById(senderId);
    if (!sender) {
        res.status(404).json({ message: "Sender not found" });
        return;
    }
    // Remove from pending and add to contacts mutually
    me.pendingRequests = me.pendingRequests.filter(id => id.toString() !== senderId.toString());
    if (!me.contacts.includes(senderId))
        me.contacts.push(senderId);
    if (!sender.contacts.includes(myId))
        sender.contacts.push(myId);
    await me.save();
    await sender.save();
    res.json({ message: "Request accepted" });
});
export const rejectRequest = TryCatch(async (req, res) => {
    const myId = req.user?._id;
    if (!myId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { senderId } = req.body;
    const me = await User.findById(myId);
    if (!me || !me.pendingRequests.includes(senderId)) {
        res.status(400).json({ message: "No pending request from this user" });
        return;
    }
    // Just remove from pending
    me.pendingRequests = me.pendingRequests.filter(id => id.toString() !== senderId.toString());
    await me.save();
    res.json({ message: "Request rejected" });
});
export const getContacts = TryCatch(async (req, res) => {
    const user = await User.findById(req.user?._id).populate("contacts", "name username email");
    res.json(user?.contacts || []);
});
export const getPendingRequests = TryCatch(async (req, res) => {
    const user = await User.findById(req.user?._id).populate("pendingRequests", "name username email");
    res.json(user?.pendingRequests || []);
});
//# sourceMappingURL=user.js.map