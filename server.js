const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "aniqueul85hassan",
    database: "ecommerce"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
    console.log("✅ MySQL Connected...");
});

// 🔐 JWT Secret Keys
const JWT_SECRET = "my_super_secret_key"; // Short-lived token (Access Token)
const REFRESH_SECRET = "my_refresh_secret_key"; // Long-lived token (Refresh Token)

let refreshTokens = []; // Store refresh tokens in memory (Use DB in production)

// 🟢 Middleware: Authenticate Users with Access Token
const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
    console.log("🔹 Token received in backend:", token);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("❌ Invalid token:", err.message);
        return res.status(401).json({ error: "Invalid token" });
    }
};

// 🟢 Middleware: Check Admin Role
const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only" });
    }
    next();
};

// 🟢 Register User
app.post("/register", async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";

        db.query(sql, [username, hashedPassword, role], (err, result) => {
            if (err) return res.status(400).json({ error: "User registration failed" });
            res.status(201).json({ message: "User registered successfully" });
        });
    } catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 🟢 Login User (Returns Access & Refresh Tokens)
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], async (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ error: "Invalid credentials" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // Generate Tokens
        const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ id: user.id, role: user.role }, REFRESH_SECRET, { expiresIn: "7d" });

        refreshTokens.push(refreshToken); // Store refresh token

        res.json({ accessToken, refreshToken, role: user.role });
    });
});

// 🟢 Refresh Token Endpoint (Generates a New Access Token)
app.post("/refresh", (req, res) => {
    const { token } = req.body;
    
    if (!token) return res.status(401).json({ error: "Refresh token required" });
    if (!refreshTokens.includes(token)) return res.status(403).json({ error: "Invalid refresh token" });

    try {
        const decoded = jwt.verify(token, REFRESH_SECRET);
        const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ error: "Invalid refresh token" });
    }
});

// 🟢 Logout (Removes Refresh Token)
app.post("/logout", (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(t => t !== token);
    res.json({ message: "Logged out successfully" });
});

// 🟢 Get All Products
app.get("/products", (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

// 🟢 Admin: Add Product
app.post("/products", authenticate, isAdmin, (req, res) => {
    const { name, price, category, stock } = req.body;

    if (!name || !price || !category || !stock) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "INSERT INTO products (name, price, category, stock) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, price, category, stock], (err, result) => {
        if (err) return res.status(400).json({ error: "Failed to add product" });
        res.status(201).json({ message: "Product added successfully" });
    });
});

// 🟢 Admin: Delete Product
app.delete("/products/:id", authenticate, isAdmin, (req, res) => {
    const productId = req.params.id;
    const sql = "DELETE FROM products WHERE id = ?";

    db.query(sql, [productId], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to delete product" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });

        res.json({ message: "Product deleted successfully" });
    });
});

// 🟢 Admin: Update Product
app.put("/products/:id", authenticate, isAdmin, (req, res) => {
    const productId = req.params.id;
    const { name, price, category, stock } = req.body;

    console.log("🔹 Request Body:", req.body); // Log the request body
    console.log("🔹 Product ID:", productId); // Log the product ID

    if (!name || !price || !category || !stock) {
        console.error("❌ Missing fields in request body");
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = "UPDATE products SET name = ?, price = ?, category = ?, stock = ? WHERE id = ?";
    db.query(sql, [name, price, category, stock, productId], (err, result) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ error: "Failed to update product" });
        }
        if (result.affectedRows === 0) {
            console.error("❌ Product not found with ID:", productId);
            return res.status(404).json({ error: "Product not found" });
        }

        console.log("✅ Product updated successfully");
        res.json({ message: "Product updated successfully" });
    });
});


// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));