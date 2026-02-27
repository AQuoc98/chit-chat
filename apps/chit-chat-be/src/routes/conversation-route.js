import express from "express";
import {
  createConversation,
  getConversations,
  getMessages,
  markAsSeen,
} from "../controllers/conversation-controller.js";
import { checkFriendship } from "../middlewares/friend-middleware.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversations);
router.get("/:conversationId/messages", getMessages);
router.patch("/:conversationId/seen", markAsSeen);

export default router;
