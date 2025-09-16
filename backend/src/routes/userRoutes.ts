import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// ---------------- Register new user ----------------
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("petName")
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage("Pet name must be between 1 and 20 characters"),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, petName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          error:
            existingUser.email === email
              ? "Email already registered"
              : "Username already taken",
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const user = new User({
        username,
        email,
        password: hashedPassword,
        petData: {
          name: petName || "Buddy",
          breed: "golden_retriever",
          happiness: 50,
          health: 100,
          items: [],
        },
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          totalCoins: user.totalCoins,
          currentStreak: user.currentStreak,
          level: user.level,
          petData: user.petData,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  }
);

// ---------------- Login user ----------------
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // Find user by username or email
      const user = await User.findOne({
        $or: [{ username }, { email: username }],
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          totalCoins: user.totalCoins,
          currentStreak: user.currentStreak,
          level: user.level,
          petData: user.petData,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  }
);

// ---------------- Get user profile ----------------
router.get("/profile", authenticateToken, async (req: Request, res: Response) => {
  try {
    // If you attached `user` in `authenticateToken`, you’ll need to extend Request type
    // Quick fix: use `any` for req.user
    const userId = (req as any).user.userId;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ---------------- Get leaderboard ----------------
import { SortOrder } from "mongoose";

router.get("/leaderboard", async (req: Request, res: Response) => {
  try {
    const type = (req.query.type as string) || "coins";
    const limit = parseInt(req.query.limit as string) || 10;

    let sortField: { [key: string]: SortOrder } = {};
    if (type === "coins") {
      sortField = { totalCoins: -1 };
    } else if (type === "streak") {
      sortField = { currentStreak: -1 };
    } else {
      return res.status(400).json({ error: "Invalid leaderboard type" });
    }

    const leaderboard = await User.find()
      .select("username totalCoins currentStreak level petData.name")
      .sort(sortField) // ✅ now correctly typed
      .limit(limit);

    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      petName: user.petData.name,
      totalCoins: user.totalCoins,
      currentStreak: user.currentStreak,
      level: user.level,
    }));

    res.json({
      type,
      leaderboard: formattedLeaderboard,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
