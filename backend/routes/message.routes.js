import express from "express"
import { protectRoute } from "../middleware/auth.js";
import {
    getMessages, getUsersForSidebar, markMessageAsSeen,
    sendMessage, sendGroupMessage, getGroupMessages, getMessageInfo, votePoll, deleteMessages
} from "../controllers/message.controllers.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.post("/send-group/:groupId", protectRoute, sendGroupMessage);
messageRouter.get("/group/:groupId", protectRoute, getGroupMessages);
messageRouter.get("/info/:id", protectRoute, getMessageInfo);
messageRouter.put("/poll/:id/vote", protectRoute, votePoll);
messageRouter.post("/delete", protectRoute, deleteMessages);

export default messageRouter;