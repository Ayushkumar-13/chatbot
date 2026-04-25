import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    text: { type: String },
    image: { type: String },
    messageType: {
        type: String,
        enum: ["text", "image", "document", "poll"],
        default: "text"
    },
    // Document Payload
    document: {
        url: { type: String },
        name: { type: String },
        size: { type: Number }
    },
    // Poll Payload
    poll: {
        question: { type: String },
        options: [{
            option: { type: String },
            votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
        }]
    },
    // For 1:1 chats
    status: {
        type: String,
        enum: ["sent", "delivered", "seen"],
        default: "sent"
    },
    // For group chats — tracks who has seen
    seenBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        seenAt: { type: Date, default: Date.now }
    }],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // backward compat
    seen: { type: Boolean, default: false },
    // Deletion states
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeletedForEveryone: { type: Boolean, default: false }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;