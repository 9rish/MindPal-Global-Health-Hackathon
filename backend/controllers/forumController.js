// This file would contain your Mongoose models for Topics and Replies.
// For demonstration, we will use a simple in-memory data store.
let forumTopics = [
    {
        _id: "topic1",
        title: "Backend Setup",
        content: "How do I set up my Express backend for the forum?",
        author: { _id: "userA", name: "Jane Doe" },
        category: "Help",
        likes: 5,
        replies: [
            {
                _id: "reply1A",
                content: "You can create a new route file and a controller for the forum.",
                author: { _id: "userB", name: "John Smith" },
                likes: 2,
                createdAt: new Date().toISOString(),
            },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        _id: "topic2",
        title: "New Feature Brainstorm",
        content: "What features should we add to the app for the hackathon?",
        author: { _id: "userC", name: "Alice" },
        category: "Announcements",
        likes: 12,
        replies: [],
        createdAt: new Date().toISOString(),
    },
];

// Controller functions to handle forum logic
const forumController = {
    // Get all topics
    getTopics: (req, res) => {
        // In a real app, you would fetch from a database here.
        res.status(200).json({ data: forumTopics });
    },

    // Create a new topic
    createPost: (req, res) => {
        // In a real app, you would save to the database.
        const { title, content, authorId, category } = req.body;
        const newTopic = {
            _id: `topic${Date.now()}`,
            title,
            content,
            author: { _id: authorId, name: "New User" }, // Assuming you get the user from auth
            category,
            likes: 0,
            replies: [],
            createdAt: new Date().toISOString(),
        };
        forumTopics.push(newTopic);
        res.status(201).json({ data: newTopic });
    },

    // Get a single topic by ID
    getTopic: (req, res) => {
        // Find the topic in the in-memory array
        const topic = forumTopics.find((t) => t._id === req.params.topicId);
        if (!topic) {
            return res.status(404).json({ message: "Topic not found" });
        }
        res.status(200).json({ data: topic });
    },

    // Add a reply to a topic
    addReply: (req, res) => {
        const { topicId } = req.params;
        const { content, authorId } = req.body;
        const topic = forumTopics.find((t) => t._id === topicId);
        if (!topic) {
            return res.status(404).json({ message: "Topic not found" });
        }

        const newReply = {
            _id: `reply${Date.now()}`,
            content,
            author: { _id: authorId, name: "Reply User" }, // Assuming you get the user from auth
            likes: 0,
            createdAt: new Date().toISOString(),
        };

        topic.replies.push(newReply);
        res.status(201).json({ data: newReply });
    },

    // Like a post or a reply
    likePost: (req, res) => {
        const { type, id } = req.body;
        if (type === "topic") {
            const topic = forumTopics.find((t) => t._id === id);
            if (topic) {
                topic.likes += 1; // Or check if the user has already liked it
                res.status(200).json({ data: { type, id, likes: topic.likes } });
            } else {
                res.status(404).json({ message: "Topic not found" });
            }
        } else if (type === "reply") {
            // Logic to find and update a reply's likes
            res.status(200).json({ message: "Reply like updated" });
        } else {
            res.status(400).json({ message: "Invalid type" });
        }
    },
};

module.exports = forumController;
