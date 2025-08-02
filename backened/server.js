import express from "express"
import "dotenv/config";
import cors from "cors"
import http from "http" // socket.io support the http server
import { connectDB } from "./conn/db.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import { Server } from "socket.io";
// Create Express app and HTTP server 
const app = express();
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

// Store online users 
export const userSocketMap = {}; // {userId: socketId}

// Socket.io connection handler 
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    console.log("User Connected", userId);

    if (userId) {
        userSocketMap[userId] = socket.id
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap) )

    socket.on("disconnect", () => {
        console.log("User disconnected" ,userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})
// Middleware setup 
app.use(express.json({limit: "4mb"}))
app.use(cors())

// Routes setup 
app.use("/api/status", (req,res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
// Connect to mongoDB

await connectDB();

if (process.env.NODE_ENV !== "production") {
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log("-----------Server is running on PORT:" + PORT + "------------") );
}

// Export server for vercel
export default server;