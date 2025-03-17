const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS
app.use(express.static('public')); // Serve static files from the "public" folder

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'aniqueul85hassan', // Replace with your MySQL password
    database: 'ecommerce'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// JWT Secret Key
const JWT_SECRET = 'your_jwt_secret_key';

// Register User
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    // Validate required fields
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 8); // Hash the password

        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.query(sql, [username, hashedPassword, role], (err, result) => {
            if (err) return res.status(400).json({ error: 'Registration failed' });
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login User
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    });
});

// Middleware to authenticate users
const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Add Product (Admin/Seller)
app.post('/products', authenticate, (req, res) => {
    const { name, price, category, stock } = req.body;
    const sellerId = req.user.role === 'seller' ? req.user.id : null;

    const sql = 'INSERT INTO products (name, price, category, stock, seller_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, price, category, stock, sellerId], (err, result) => {
        if (err) return res.status(400).json({ error: 'Failed to add product' });
        res.status(201).json({ message: 'Product added successfully' });
    });
});

// Update Product (Admin/Seller)
app.put('/products/:id', authenticate, (req, res) => {
    const { name, price, category, stock } = req.body;
    const productId = req.params.id;
    const sellerId = req.user.role === 'seller' ? req.user.id : null;

    const sql = 'UPDATE products SET name = ?, price = ?, category = ?, stock = ? WHERE id = ? AND (seller_id = ? OR ? IS NULL)';
    db.query(sql, [name, price, category, stock, productId, sellerId, sellerId], (err, result) => {
        if (err) return res.status(400).json({ error: 'Failed to update product' });
        res.json({ message: 'Product updated successfully' });
    });
});

// Delete Product (Admin/Seller)
app.delete('/products/:id', authenticate, (req, res) => {
    const productId = req.params.id;
    const sellerId = req.user.role === 'seller' ? req.user.id : null;

    const sql = 'DELETE FROM products WHERE id = ? AND (seller_id = ? OR ? IS NULL)';
    db.query(sql, [productId, sellerId, sellerId], (err, result) => {
        if (err) return res.status(400).json({ error: 'Failed to delete product' });
        res.json({ message: 'Product deleted successfully' });
    });
});

// Get All Products (with search and filter)
app.get('/products', (req, res) => {
    const { category, minPrice, maxPrice } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
        sql += ' AND category = ?';
        params.push(category);
    }
    if (minPrice) {
        sql += ' AND price >= ?';
        params.push(minPrice);
    }
    if (maxPrice) {
        sql += ' AND price <= ?';
        params.push(maxPrice);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});