import dns from "node:dns";
// Force IPv4 resolution
dns.setDefaultResultOrder("ipv4first");
// IMPORTANT: Disable keep-alive on the global HTTPS agent BEFORE importing cloudinary.
// Node.js keep-alive reuses connections to api.cloudinary.com which causes uploads
// to hang indefinitely (HTTP 499 TimeoutError). This must come before any import
// that triggers network activity.
import https from "https";
https.globalAgent = new https.Agent({ keepAlive: false });
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Log at startup to verify credentials are loaded (remove in production)
console.log("[Cloudinary] Config loaded:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "❌ MISSING",
    api_key: process.env.CLOUDINARY_API_KEY ? "✓ set" : "❌ MISSING",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "✓ set" : "❌ MISSING",
});
export default cloudinary;
//# sourceMappingURL=cloudinary.js.map