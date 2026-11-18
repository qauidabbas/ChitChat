import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter once at startup (not per-message)
// NOTE: Use MAIL_USER / MAIL_PASS — NOT USER (reserved OS variable)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// RABBITMQ_URL (e.g. amqps://user:pass@host/vhost from CloudAMQP) takes precedence over host/username/password
const RABBITMQ_URL = process.env.RABBITMQ_URL || {
    protocol: "amqp" as const,
    hostname: process.env.RABBITMQ_HOST!,
    port: 5672,
    username: process.env.RABBITMQ_USERNAME!,
    password: process.env.RABBITMQ_PASSWORD!,
};

const QUEUE_NAME = "send-otp";

const MAIL_FROM = process.env.MAIL_FROM || process.env.MAIL_USER;

// Brevo's HTTPS API is used when BREVO_API_KEY is set (for hosts that block outbound SMTP); otherwise Gmail SMTP.
const sendMail = async (to: string, subject: string, text: string): Promise<void> => {
    if (!process.env.BREVO_API_KEY) {
        await transporter.sendMail({ from: `"ChitChat" <${MAIL_FROM}>`, to, subject, text });
        return;
    }
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({
            sender: { name: "ChitChat", email: MAIL_FROM },
            to: [{ email: to }],
            subject,
            textContent: text,
        }),
    });
    if (!res.ok) throw new Error(`Brevo API ${res.status}: ${await res.text()}`);
};

// Recursive retry — reconnects if RabbitMQ drops the connection (common on cloud brokers)
export const startSendOtpConsumer = async (): Promise<void> => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);

        // Handle unexpected connection drops
        connection.on("error", (err) => {
            console.error("[RabbitMQ] Connection error:", err.message);
        });
        connection.on("close", () => {
            console.warn("[RabbitMQ] Connection closed. Retrying in 5s...");
            setTimeout(startSendOtpConsumer, 5000);
        });

        const channel = await connection.createChannel();
        channel.on("error", (err) => {
            console.error("[RabbitMQ] Channel error:", err.message);
        });

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.prefetch(1); // Process one message at a time
        console.log("[Mail] Consumer started — listening on queue:", QUEUE_NAME);

        channel.consume(QUEUE_NAME, async (message) => {
            if (!message) return;
            try {
                const { to, subject, body } = JSON.parse(message.content.toString());
                await sendMail(to, subject, body);
                console.log(`[Mail] OTP email sent to ${to}`);
                channel.ack(message);
            } catch (error) {
                console.error("[Mail] Error sending OTP email:", error);
                // Nack and requeue so the message is not lost
                channel.nack(message, false, true);
            }
        });
    } catch (error) {
        console.error("[RabbitMQ] Failed to connect:", error);
        console.warn("[RabbitMQ] Retrying in 5s...");
        setTimeout(startSendOtpConsumer, 5000);
    }
};