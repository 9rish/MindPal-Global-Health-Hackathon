const express = require("express");
const router = express.Router();
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");
const forumController = require("../controllers/forumController");

// Get all forum topics
router.get("/", authorization, wrapAsync(forumController.getTopics));

// Create a new forum post/topic
router.post("/", authorization, wrapAsync(forumController.createPost));

// Get a single topic and its replies
router.get("/:topicId", authorization, wrapAsync(forumController.getTopic));

// Add a new reply to a topic
router.post("/:topicId/replies", authorization, wrapAsync(forumController.addReply));

// Handle likes for posts and replies
router.post("/like", authorization, wrapAsync(forumController.likePost));

module.exports = router;