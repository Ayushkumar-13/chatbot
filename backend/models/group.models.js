import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    description: { type: String, default: "" },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["admin", "member"], default: "member" }
    }]
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);
export default Group;
