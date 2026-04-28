import User from "../models/user.models.js";
import Message from "../models/message.models.js";
import cloudinary from "../utils/cloudinary.js";
import { io } from "../server.js";
import { userSocketMap } from "../server.js";

// Get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        // Count unseen messages per user
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({
                senderId: user._id,
                receiverId: userId,
                status: { $ne: "seen" }
            });
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        });
        await Promise.all(promises);

        // Get last message per user for preview
        const lastMessages = {};
        const lastMsgPromises = filteredUsers.map(async (user) => {
            const lastMsg = await Message.findOne({
                $or: [
                    { senderId: userId, receiverId: user._id },
                    { senderId: user._id, receiverId: userId }
                ],
                groupId: { $exists: false }
            }).sort({ createdAt: -1 });
            if (lastMsg) lastMessages[user._id] = lastMsg;
        });
        await Promise.all(lastMsgPromises);

        res.json({ success: true, users: filteredUsers, unseenMessages, lastMessages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all messages for selected user (1:1)
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ],
            groupId: { $exists: false },
            deletedFor: { $ne: myId }
        }).sort({ createdAt: 1 });

        // Mark all incoming messages as seen and notify senders
        const unseenMessages = messages.filter(
            m => m.senderId.toString() === selectedUserId && m.status !== "seen"
        );

        if (unseenMessages.length > 0) {
            await Message.updateMany(
                { senderId: selectedUserId, receiverId: myId, status: { $ne: "seen" } },
                { status: "seen", seen: true }
            );

            // Notify the other user their messages were seen
            const senderSocketId = userSocketMap[selectedUserId];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesSeen", {
                    by: myId,
                    messageIds: unseenMessages.map(m => m._id)
                });
            }
        }

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Mark a single message as seen (used when receiver is in chat)
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        const myId = req.user._id;

        const message = await Message.findByIdAndUpdate(
            id,
            { status: "seen", seen: true },
            { new: true }
        );

        if (message) {
            const senderSocketId = userSocketMap[message.senderId.toString()];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesSeen", {
                    by: myId,
                    messageIds: [id]
                });
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Send message to selected user (1:1)
export const sendMessage = async (req, res) => {
    try {
        const { text, image, document, poll, audio, waveform } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        let audioUrl;
        if (audio) {
            // Sanitize audio data URI: some browsers add ;codecs=opus which Cloudinary might not like
            const sanitizedAudio = audio.replace(/;codecs=[^;,]+/, "");
            const uploadResponse = await cloudinary.uploader.upload(sanitizedAudio, { resource_type: "video" });
            audioUrl = uploadResponse.secure_url;
        }

        let documentData;
        if (document && document.url) {
            const uploadResponse = await cloudinary.uploader.upload(document.url, { resource_type: "auto" });
            documentData = { url: uploadResponse.secure_url, name: document.name, size: document.size };
        }

        let pollData;
        if (poll) {
            pollData = { question: poll.question, options: poll.options.map(o => ({ option: o, votes: [] })) };
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            image: imageUrl,
            audio: audioUrl,
            waveform: waveform || [],
            document: documentData,
            poll: pollData,
            text,
            messageType: audio ? "audio" : document ? "document" : poll ? "poll" : image ? "image" : "text",
            status: "sent"
        });

        // Check if receiver is online
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            // Emit message to receiver
            io.to(receiverSocketId).emit("newMessage", newMessage);

            // Update status to delivered
            await Message.findByIdAndUpdate(newMessage._id, { status: "delivered" });
            newMessage.status = "delivered";

            // Notify sender of delivery
            const senderSocketId = userSocketMap[senderId.toString()];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageDelivered", {
                    messageId: newMessage._id
                });
            }
        }

        res.json({ success: true, newMessage });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Send message to a group
export const sendGroupMessage = async (req, res) => {
    try {
        const { text, image, document, poll, audio, waveform } = req.body;
        const groupId = req.params.groupId;
        const senderId = req.user._id;

        // Import Group here to avoid circular dep
        const { default: Group } = await import("../models/group.models.js");
        const group = await Group.findById(groupId);
        if (!group) return res.json({ success: false, message: "Group not found" });

        let imageUrl;
        if (image) {
            const upload = await cloudinary.uploader.upload(image);
            imageUrl = upload.secure_url;
        }

        let audioUrl;
        if (audio) {
            // Sanitize audio data URI
            const sanitizedAudio = audio.replace(/;codecs=[^;,]+/, "");
            const upload = await cloudinary.uploader.upload(sanitizedAudio, { resource_type: "video" });
            audioUrl = upload.secure_url;
        }

        let documentData;
        if (document && document.url) {
            const uploadResponse = await cloudinary.uploader.upload(document.url, { resource_type: "auto" });
            documentData = { url: uploadResponse.secure_url, name: document.name, size: document.size };
        }

        let pollData;
        if (poll) {
            pollData = { question: poll.question, options: poll.options.map(o => ({ option: o, votes: [] })) };
        }

        const newMessage = await Message.create({
            senderId,
            groupId,
            text,
            image: imageUrl,
            audio: audioUrl,
            waveform: waveform || [],
            document: documentData,
            poll: pollData,
            messageType: audio ? "audio" : document ? "document" : poll ? "poll" : image ? "image" : "text",
            status: "sent"
        });

        // Populate sender info for display
        const populatedMsg = await Message.findById(newMessage._id);

        // Emit to all online group members except sender
        group.members.forEach(member => {
            if (member.userId.toString() !== senderId.toString()) {
                const socketId = userSocketMap[member.userId.toString()];
                if (socketId) {
                    io.to(socketId).emit("newGroupMessage", populatedMsg);
                }
            }
        });

        res.json({ success: true, newMessage: populatedMsg });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            groupId,
            deletedFor: { $ne: myId }
        }).sort({ createdAt: 1 });

        // Mark as seen by this user
        const unseenIds = messages
            .filter(m =>
                m.senderId.toString() !== myId.toString() &&
                !m.seenBy.some(s => s.userId.toString() === myId.toString())
            )
            .map(m => m._id);

        if (unseenIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: unseenIds } },
                { $addToSet: { seenBy: { userId: myId, seenAt: new Date() } } }
            );
        }

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get message info (who has seen it)
export const getMessageInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id)
            .populate("seenBy.userId", "fullName profilePic")
            .populate("deliveredTo", "fullName profilePic");
        if (!message) return res.json({ success: false, message: "Message not found" });
        res.json({ success: true, message });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Vote on a poll
export const votePoll = async (req, res) => {
    try {
        const { id } = req.params; // message Id
        const { optionIndex } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(id);
        if (!message || message.messageType !== "poll") {
            return res.json({ success: false, message: "Poll not found" });
        }

        // Apply true single-select radio toggle logic
        if (optionIndex !== null && optionIndex !== undefined && message.poll.options[optionIndex]) {
            const targetOption = message.poll.options[optionIndex];
            const hasVotedIndex = targetOption.votes.findIndex(v => v.toString() === userId.toString());

            // Remove previous vote from ANY option
            message.poll.options.forEach(opt => {
                opt.votes = opt.votes.filter(v => v.toString() !== userId.toString());
            });

            if (hasVotedIndex === -1) {
                // If they weren't voted in THIS option previously, vote for it now
                targetOption.votes.push(userId);
            }
        }

        message.markModified('poll');
        await message.save();

        // Broadcast to relevant users or room
        if (message.groupId) {
            io.to(`group_${message.groupId}`).emit("pollUpdated", message);
        } else {
            const senderSocket = userSocketMap[message.senderId.toString()];
            const receiverSocket = userSocketMap[message.receiverId.toString()];
            if (senderSocket) io.to(senderSocket).emit("pollUpdated", message);
            if (receiverSocket) io.to(receiverSocket).emit("pollUpdated", message);
        }

        res.json({ success: true, message });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Delete Messages
export const deleteMessages = async (req, res) => {
    try {
        const { messageIds, type } = req.body;
        const myId = req.user._id;

        if (!messageIds || messageIds.length === 0) return res.json({ success: true });

        if (type === "me") {
            await Message.updateMany(
                { _id: { $in: messageIds } },
                { $addToSet: { deletedFor: myId } }
            );
            return res.json({ success: true });
        } else if (type === "everyone") {
            await Message.updateMany(
                { _id: { $in: messageIds }, senderId: myId },
                { isDeletedForEveryone: true }
            );

            // Fetch info to broadcast cleanly
            const updated = await Message.find({ _id: { $in: messageIds } });

            // Depending on group or 1:1, broadcast to affected users
            // Simplest way is to broadcast universally mapped events
            updated.forEach(msg => {
                if (msg.groupId) {
                    io.to(`group_${msg.groupId}`).emit("messagesDeletedEveryone", [msg._id]);
                } else {
                    const senderSocket = userSocketMap[msg.senderId.toString()];
                    const receiverSocket = userSocketMap[msg.receiverId?.toString()];
                    if (senderSocket) io.to(senderSocket).emit("messagesDeletedEveryone", [msg._id]);
                    if (receiverSocket) io.to(receiverSocket).emit("messagesDeletedEveryone", [msg._id]);
                }
            });

            return res.json({ success: true });
        }

        res.json({ success: false, message: "Invalid type" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};