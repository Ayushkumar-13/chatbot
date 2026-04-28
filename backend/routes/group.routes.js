import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
    createGroup, getUserGroups, updateGroup,
    addMember, removeMember, leaveGroup, deleteGroup, updateMemberRole
} from "../controllers/group.controllers.js";

const groupRouter = express.Router();

groupRouter.post("/create", protectRoute, createGroup);
groupRouter.get("/", protectRoute, getUserGroups);
groupRouter.put("/:groupId/update", protectRoute, updateGroup);
groupRouter.put("/:groupId/add-member", protectRoute, addMember);
groupRouter.put("/:groupId/remove-member", protectRoute, removeMember);
groupRouter.put("/:groupId/update-role", protectRoute, updateMemberRole);
groupRouter.put("/:groupId/leave", protectRoute, leaveGroup);
groupRouter.delete("/:groupId", protectRoute, deleteGroup);

export default groupRouter;
