import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const [lastMessages, setLastMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    // ── Fetch Users (sidebar) ────────────────────────────────────────────
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages || {});
                setLastMessages(data.lastMessages || {});
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ── Fetch Groups ─────────────────────────────────────────────────────
    const getGroups = async () => {
        try {
            const { data } = await axios.get("/api/groups");
            if (data.success) setGroups(data.groups);
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ── Create Group ─────────────────────────────────────────────────────
    const createGroup = async (groupData) => {
        try {
            const { data } = await axios.post("/api/groups/create", groupData);
            if (data.success) {
                setGroups(prev => [...prev, data.group]);
                toast.success("Group created!");
                return data.group;
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ── Fetch 1:1 Messages ───────────────────────────────────────────────
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) setMessages(data.messages);
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ── Fetch Group Messages ─────────────────────────────────────────────
    const getGroupMessages = async (groupId) => {
        try {
            const { data } = await axios.get(`/api/messages/group/${groupId}`);
            if (data.success) setMessages(data.messages);
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ── Send 1:1 Message ─────────────────────────────────────────────────
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages(prev => [...prev, data.newMessage]);
                setLastMessages(prev => ({ ...prev, [selectedUser._id]: data.newMessage }));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    // ── Send Group Message ───────────────────────────────────────────────
    const sendGroupMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send-group/${selectedGroup._id}`, messageData);
            if (data.success) {
                setMessages(prev => [...prev, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    // ── Delete Messages ──────────────────────────────────────────────────
    const deleteMessagesAction = async (messageIds, type) => {
        try {
            const { data } = await axios.post(`/api/messages/delete`, { messageIds, type });
            if (data.success) {
                if (type === "me") {
                    setMessages(prev => prev.filter(m => !messageIds.includes(m._id)));
                } else if (type === "everyone") {
                    setMessages(prev => prev.map(m => messageIds.includes(m._id) ? { ...m, isDeletedForEveryone: true } : m));
                }
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    // ── Socket: Subscribe to real-time events ────────────────────────────
    useEffect(() => {
        if (!socket) return;

        // New 1:1 message
        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages(prev => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
            } else {
                setUnseenMessages(prev => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
                }));
            }
            setLastMessages(prev => ({ ...prev, [newMessage.senderId]: newMessage }));
        });

        // New group message
        socket.on("newGroupMessage", (newMessage) => {
            if (selectedGroup && newMessage.groupId === selectedGroup._id) {
                setMessages(prev => [...prev, newMessage]);
            } else {
                setUnseenMessages(prev => ({
                    ...prev,
                    [`group_${newMessage.groupId}`]: (prev[`group_${newMessage.groupId}`] || 0) + 1
                }));
            }
        });

        // Message delivery status update
        socket.on("messageDelivered", ({ messageId }) => {
            setMessages(prev =>
                prev.map(m => m._id === messageId ? { ...m, status: "delivered" } : m)
            );
        });

        // Messages seen by the other party
        socket.on("messagesSeen", ({ messageIds }) => {
            setMessages(prev =>
                prev.map(m => messageIds.includes(m._id) ? { ...m, status: "seen" } : m)
            );
        });

        // Update last seen
        socket.on("userLastSeen", ({ userId, lastSeen }) => {
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, lastSeen } : u));
        });

        // Poll votes updated
        socket.on("pollUpdated", (updatedMessage) => {
            setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
        });

        // Global message deletion
        socket.on("messagesDeletedEveryone", (messageIds) => {
            setMessages(prev => prev.map(m => messageIds.includes(m._id) ? { ...m, isDeletedForEveryone: true } : m));
        });

        return () => {
            socket.off("newMessage");
            socket.off("newGroupMessage");
            socket.off("messageDelivered");
            socket.off("messagesSeen");
            socket.off("userLastSeen");
            socket.off("pollUpdated");
            socket.off("messagesDeletedEveryone");
        };
    }, [socket, selectedUser, selectedGroup]);

    const value = {
        messages, setMessages,
        users, setUsers,
        groups, setGroups,
        selectedUser, setSelectedUser,
        selectedGroup, setSelectedGroup,
        unseenMessages, setUnseenMessages,
        lastMessages,
        getUsers, getGroups, createGroup,
        getMessages, getGroupMessages,
        sendMessage, sendGroupMessage, deleteMessagesAction
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};