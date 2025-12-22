const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asset_manager',
    waitForConnections: true,
    connectionLimit: 10
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email } = ticket.getPayload();
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(403).json({ error: "Access denied." });
        }
        res.cookie('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax',
            maxAge: 3600000 
        });
        res.json({ message: "Login successful", user: { name, email } });
    } catch (err) {
        console.error("OAuth Error:", err);
        res.status(401).json({ error: "Invalid Google authentication." });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('session_token');
    res.json({ message: "Logged out successfully" });
});

// POST: Update Asset Assignment
app.post('/api/assets/reassign', async (req, res) => {
    const { asset_id, new_employee_id, new_employee_name, old_employee_id, remarks } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        await connection.query(
            'UPDATE assignment_history SET to_date = CURDATE(), remarks = ? WHERE asset_id = ? AND employee_id = ? AND to_date IS NULL',
            [remarks, asset_id, old_employee_id]
        );
        await connection.query(
            'INSERT INTO assignment_history (asset_id, employee_id, employee_name, from_date) VALUES (?, ?, ?, CURDATE())',
            [asset_id, new_employee_id, new_employee_name]
        );

        await connection.commit();
        res.json({ message: "Asset reassigned successfully" });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: "Reassignment failed" });
    } finally {
        connection.release();
    }
});
// --- USER MANAGEMENT ROUTES ---

app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//create
app.post('/api/users', async (req, res) => {
    const { name, email } = req.body;
    try {
        await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
        res.status(201).json({ message: "User added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//update
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
        res.json({ message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//-------------------------------------------------------------------------
// POST: Update Asset Assignment
app.post('/api/assets/reassign', async (req, res) => {
    const { asset_id, new_employee_id, new_employee_name, old_employee_id, remarks } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        await connection.query(
            'UPDATE assignment_history SET to_date = CURDATE(), remarks = ? WHERE asset_id = ? AND employee_id = ? AND to_date IS NULL',
            [remarks, asset_id, old_employee_id]
        );
        await connection.query(
            'INSERT INTO assignment_history (asset_id, employee_id, employee_name, from_date) VALUES (?, ?, ?, CURDATE())',
            [asset_id, new_employee_id, new_employee_name]
        );

        await connection.commit();
        res.json({ message: "Asset reassigned successfully" });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: "Reassignment failed" });
    } finally {
        connection.release();
    }
});
// --- USER MANAGEMENT ROUTES ---

app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Asset History (Requirement: Newest remark at top)
app.get('/api/assets/history/:assetId', async (req, res) => {
    const { assetId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT employee_id, employee_name, 
                    DATE_FORMAT(from_date, '%Y-%m-%d') as from_date, 
                    DATE_FORMAT(to_date, '%Y-%m-%d') as to_date, 
                    remarks 
             FROM assignment_history 
             WHERE asset_id = ? 
             ORDER BY id DESC`, // Newest first
            [assetId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Deep Asset View (Requirement: Device Info & Configuration)
app.get('/api/assets/details/:assetId', async (req, res) => {
    const { assetId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM assets WHERE asset_id = ?', 
            [assetId]
        );
        if (rows.length === 0) return res.status(404).json({ error: "Asset not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));