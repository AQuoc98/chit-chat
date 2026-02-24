import express from "express";
import {
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
  getFriendRequests,
  sendFriendRequest,
} from "../controllers/friend-controller";

const router: express.Router = express.Router();

router.post("/requests", sendFriendRequest);

router.post("/requests/:requestId/accept", acceptFriendRequest);
router.post("/requests/:requestId/decline", declineFriendRequest);

router.get("/", getAllFriends);
router.get("/requests", getFriendRequests);

export default router;
