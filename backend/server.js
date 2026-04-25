import express from "express"
import "dotenv/config";
import cors from "cors"
import http from "http"
import { connectDB } from "./conn/db.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import groupRouter from "./routes/group.routes.js";
import { Server } from "socket.io";
import User from "./models/user.models.js";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
    cors: { origin: "*" }
});

export const userSocketMap = {}; // { userId: socketId }

// ─── Socket.IO Hub ────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // ── WebRTC Call Signaling ──────────────────────────────────────────────────

    // Sender → Receiver: offer
    socket.on("call:offer", (data) => {
        const receiverSocketId = userSocketMap[data.to];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("call:incoming", {
                from: userId,
                offer: data.offer,
                callType: data.callType,
                callerInfo: data.callerInfo
            });
        }
    });

    // Receiver → Sender: answer
    socket.on("call:answer", (data) => {
        const callerSocketId = userSocketMap[data.to];
        if (callerSocketId) {
            io.to(callerSocketId).emit("call:answered", {
                from: userId,
                answer: data.answer
            });
        }
    });

    // ICE candidates (bidirectional)
    socket.on("call:ice-candidate", (data) => {
        const targetSocketId = userSocketMap[data.to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("call:ice-candidate", {
                from: userId,
                candidate: data.candidate
            });
        }
    });

    // Receiver rejected call
    socket.on("call:rejected", (data) => {
        const callerSocketId = userSocketMap[data.to];
        if (callerSocketId) {
            io.to(callerSocketId).emit("call:rejected", { from: userId });
        }
    });

    // Either party ended call
    socket.on("call:ended", (data) => {
        const otherSocketId = userSocketMap[data.to];
        if (otherSocketId) {
            io.to(otherSocketId).emit("call:ended", { from: userId });
        }
    });

    // ── Disconnect ─────────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        try {
            const now = new Date();
            await User.findByIdAndUpdate(userId, { lastSeen: now });
            io.emit("userLastSeen", { userId, lastSeen: now });
        } catch (e) {
            console.error("Error updating lastSeen:", e);
        }
    });
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);

// ─── Start Server with retry ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = (attempt = 1) => {
    server.listen(PORT, () => {
        console.log(`-----------Server is running on PORT:${PORT}------------`);
    });
};

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.log(`Port ${PORT} busy, retrying in 1s...`);
        setTimeout(() => {
            server.close();
            startServer();
        }, 1000);
    } else {
        console.error("Server error:", err.message);
    }
});

startServer();

// MongoDB (background with retry)
connectDB();

export default server;