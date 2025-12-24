const pool = require('../config/db');
const client = require('../config/oauth');
require('dotenv').config();
exports.googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        if (email === process.env.ADMIN_EMAIL) {
            const adminUser = {
                name: payload.name,
                email: payload.email,
                role: 'admin'
            };
            req.session.user = adminUser; 
            return res.json({ user: adminUser });
        } else {
            return res.status(403).json({ error: "Access Denied: Only the Super Admin can access this system." });
        }
    } catch (error) {
        res.status(500).json({ error: "Authentication failed" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('session_token');
    res.json({ message: "Logged out successfully" });
};

exports.getMe = (req, res) => {
    if (req.user) {
        res.status(200).json({ user: req.user });
    } else {
        res.status(401).json({ error: "Not authenticated" });
    }
};