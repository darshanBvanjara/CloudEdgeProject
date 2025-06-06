const express = require("express");
const cors = require("cors");
const connectDB = require("./db.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("./userModel.js");
const app = express();
dotenv.config();

const saltRounds = 10;

app.use(cors());
app.use(express.json());

app.get("/test", async (req, res) => {
    res.json("OK", 200);
});

app.post("/register", async (req, res) => {
    console.log("Received request!");
    const { name, password, email } = req.body;
    const role = req.query.role || "user"; // default to 'user' if not provided

    if (!name || !email || !password) {
        return res.status(400).json({
            status: "Error",
            message: "Missing required fields.",
        });
    }

    if (!["user", "admin", "employee"].includes(role)) {
        return res.status(400).json({
            status: "Error",
            message: "Invalid role specified.",
        });
    }

    const checkUser = await User.findOne({ email });
    if (checkUser) {
        return res.json({
            status: "Error",
            message: "User already exists!",
        });
    }

    const hash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
        name,
        password: hash,
        email,
        role,
    });

    if (newUser) {
        console.log("Successfully created new user!");
        return res.status(200).json({
            status: "Success",
            message: "Successfully created a new user!",
        });
    }

    return res.status(400).json({
        status: "Error",
        message: "Error occurred while creating a new user.",
    });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: "Error",
            message: "Email and password are required.",
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                status: "Error",
                message: "User not found.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                status: "Error",
                message: "Invalid password.",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("User logged in!");
        console.log(token, {
            name: user.name,
            email: user.email,
        });
        return res.status(200).json({
            status: "Success",
            message: "Login successful!",
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            status: "Error",
            message: "Server error during login.",
        });
    }
});

app.post("/verify", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            status: "Error",
            message: "Token is required",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({
            status: "Success",
            message: "Token is valid",
            user: decoded, // contains id, email, etc.
        });
    } catch (err) {
        return res.status(401).json({
            status: "Error",
            message: "Invalid or expired token",
        });
    }
});

app.post("/verifyRole", async (req, res) => {
    console.log("Verifying role...");
    const token = req.headers?.authorization?.split(" ")[1];
    const roles = req.body.roles;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!roles.includes(decoded.role)) {
            return res
                .status(403)
                .json({ message: "Forbidden: insufficient role" });
        }
        return res.status(200).json({ message: "Sufficient permissions." });
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
});

connectDB()
    .then(() => {
        console.log("✅ Connected to MongoDB");

        app.listen(process.env.PORT, () => {
            console.log(
                `🚀 Auth service is running on http://localhost:${process.env.PORT}`
            );
        });
    })
    .catch((err) => {
        console.error("❌ Failed to connect to MongoDB:", err);
        process.exit(1);
    });
