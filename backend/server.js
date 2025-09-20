const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const corsOptions = {
	origin: "*", // allow all for now
	methods: ["GET", "POST", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

// All routers
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");
const forumRouter = require("./routes/forum");

// Connect to Database
main()
	.then(() => console.log("Database Connection established"))
	.catch((err) => console.log(err));

async function main() {
	await mongoose.connect(process.env.MONGODB_URI);
}

// Root route
app.get("/", (req, res) => {
	res.json({
		message: "Welcome to Chat Application!",
		frontend_url: process.env.FRONTEND_URL,
	});
});

// All routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/forum", forumRouter);

// Invalid routes
app.all("*", (req, res) => {
	res.json({ error: "Invalid Route" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	const errorMessage = err.message || "Something Went Wrong!";
	res.status(500).json({ message: errorMessage });
});

// Start the server
const server = app.listen(PORT, "0.0.0.0", async () => {
	console.log(`Server listening on ${PORT}`);
});

// Socket.IO setup
const { Server } = require("socket.io");
const io = new Server(server, {
	pingTimeout: 60000,
	transports: ["websocket"],
	cors: corsOptions,
});

// Socket connection
io.on("connection", (socket) => {
	console.log("Connected to socket.io:", socket.id);

	// Forum event handlers
	const forumHandlers = {
		getTopics: () => {
			console.log("Received getTopics request");
			const topics = [
		{
			_id: "topic1",
			title: "Backend Setup",
			content: "How do I set up my Express backend for the forum?",
			author: { name: "Jane Doe" },
			category: "Help",
			likes: 5,
			replies: [],
			createdAt: new Date().toISOString(),
		},
		{
			_id: "topic2",
			title: "New Feature Brainstorm",
			content: "What features should we add to the app for the hackathon?",
			author: { name: "Admin" },
			category: "Announcements",
			likes: 12,
			replies: [],
			createdAt: new Date().toISOString(),
		},
		];

			// Emit topics via "forumTopics" event
			socket.emit("forumTopics", topics);
		},
		createPost: ({ post }) => {
			console.log("New post created:", post);
			io.emit("newPost", post);
		},
		createReply: ({ topicId, reply }) => {
			console.log(`New reply on topic ${topicId}:`, reply);
			io.emit("newReply", { topicId, reply });
		},
		likePost: ({ type, id, userId }) => {
			console.log(`${userId} liked a ${type} with ID ${id}`);
			io.emit("updateLikes", {
				type,
				id,
				likes: Math.floor(Math.random() * 20) + 1,
			});
		},
	};

	// Chat & User Handlers
	const setupHandler = (userId) => {
		if (!socket.hasJoined) {
			socket.join(userId);
			socket.hasJoined = true;
			console.log("User joined:", userId);
			socket.emit("connected");
		}
	};

	const newMessageHandler = (newMessageReceived) => {
		let chat = newMessageReceived?.chat;
		chat?.users.forEach((user) => {
			if (user._id === newMessageReceived.sender._id) return;
			socket.in(user._id).emit("message received", newMessageReceived);
		});
	};

	const joinChatHandler = (room) => {
		if (socket.currentRoom === room) return;
		if (socket.currentRoom) socket.leave(socket.currentRoom);
		socket.join(room);
		socket.currentRoom = room;
	};

	const typingHandler = (room) => {
		socket.in(room).emit("typing");
	};

	const stopTypingHandler = (room) => {
		socket.in(room).emit("stop typing");
	};

	const clearChatHandler = (chatId) => {
		socket.in(chatId).emit("clear chat", chatId);
	};

	const deleteChatHandler = (chat, authUserId) => {
		chat.users.forEach((user) => {
			if (authUserId === user._id) return;
			socket.in(user._id).emit("delete chat", chat._id);
		});
	};

	const chatCreateChatHandler = (chat, authUserId) => {
		chat.users.forEach((user) => {
			if (authUserId === user._id) return;
			socket.in(user._id).emit("chat created", chat);
		});
	};

	// Socket listeners
	socket.on("setup", setupHandler);
	socket.on("new message", newMessageHandler);
	socket.on("join chat", joinChatHandler);
	socket.on("typing", typingHandler);
	socket.on("stop typing", stopTypingHandler);
	socket.on("clear chat", clearChatHandler);
	socket.on("delete chat", deleteChatHandler);
	socket.on("chat created", chatCreateChatHandler);

	// Forum listeners
	socket.on("getTopics", forumHandlers.getTopics);
	socket.on("createPost", forumHandlers.createPost);
	socket.on("createReply", forumHandlers.createReply);
	socket.on("likePost", forumHandlers.likePost);

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
	});
});
