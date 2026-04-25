import Group from "../models/group.models.js";
import Message from "../models/message.models.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, description, members, avatar } = req.body;
        const createdBy = req.user._id;

        if (!name || !members || members.length === 0) {
            return res.json({ success: false, message: "Name and at least one member are required" });
        }

        let avatarUrl = "";
        if (avatar) {
            const upload = await cloudinary.uploader.upload(avatar);
            avatarUrl = upload.secure_url;
        }

        const allMembers = [
            { userId: createdBy, role: "admin" },
            ...members.map(id => ({ userId: id, role: "member" }))
        ];

        const group = await Group.create({ name, description: description || "", avatar: avatarUrl, createdBy, members: allMembers });
        const populated = await Group.findById(group._id).populate("members.userId", "-password");

        res.json({ success: true, group: populated });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all groups for current user
export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ "members.userId": userId })
            .populate("members.userId", "-password");
        res.json({ success: true, groups });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Update group info (admin only)
export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, avatar } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.json({ success: false, message: "Group not found" });

        const member = group.members.find(m => m.userId.toString() === userId.toString());
        if (!member || member.role !== "admin") {
            return res.json({ success: false, message: "Only admins can update the group" });
        }

        let avatarUrl = group.avatar;
        if (avatar) {
            const upload = await cloudinary.uploader.upload(avatar);
            avatarUrl = upload.secure_url;
        }

        const updated = await Group.findByIdAndUpdate(
            groupId,
            { name: name || group.name, description: description ?? group.description, avatar: avatarUrl },
            { new: true }
        ).populate("members.userId", "-password");

        res.json({ success: true, group: updated });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Add member (admin only)
export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId: newUserId } = req.body;
        const adminId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.json({ success: false, message: "Group not found" });

        const admin = group.members.find(m => m.userId.toString() === adminId.toString());
        if (!admin || admin.role !== "admin") {
            return res.json({ success: false, message: "Only admins can add members" });
        }

        if (group.members.some(m => m.userId.toString() === newUserId)) {
            return res.json({ success: false, message: "User already in group" });
        }

        group.members.push({ userId: newUserId, role: "member" });
        await group.save();

        const updated = await Group.findById(groupId).populate("members.userId", "-password");
        res.json({ success: true, group: updated });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Remove member (admin only)
export const removeMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId: removeId } = req.body;
        const adminId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.json({ success: false, message: "Group not found" });

        const admin = group.members.find(m => m.userId.toString() === adminId.toString());
        if (!admin || admin.role !== "admin") {
            return res.json({ success: false, message: "Only admins can remove members" });
        }

        group.members = group.members.filter(m => m.userId.toString() !== removeId);
        await group.save();

        const updated = await Group.findById(groupId).populate("members.userId", "-password");
        res.json({ success: true, group: updated });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Leave group
export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.json({ success: false, message: "Group not found" });

        group.members = group.members.filter(m => m.userId.toString() !== userId.toString());

        // If no members left, delete the group
        if (group.members.length === 0) {
            await Group.findByIdAndDelete(groupId);
            return res.json({ success: true, message: "Group deleted (no members left)" });
        }

        // If admin left, promote the next member
        const hasAdmin = group.members.some(m => m.role === "admin");
        if (!hasAdmin && group.members.length > 0) {
            group.members[0].role = "admin";
        }

        await group.save();
        res.json({ success: true, message: "Left group" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Delete group (admin only)
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.json({ success: false, message: "Group not found" });

        const admin = group.members.find(m => m.userId.toString() === userId.toString() && m.role === "admin");
        if (!admin) return res.json({ success: false, message: "Only admins can delete the group" });

        await Group.findByIdAndDelete(groupId);
        await Message.deleteMany({ groupId });

        res.json({ success: true, message: "Group deleted" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
