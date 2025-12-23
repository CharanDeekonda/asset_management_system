const pool = require('../config/db');


exports.getAllAssetTypes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM asset_types ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.addAsset = async (req, res) => {
    const { 
        asset_id, type_id, brand, model, bought_on, 
        ram, processor, screen_size, os, storage_capacity 
    } = req.body;
    
    try {
        const query = `
            INSERT INTO assets 
            (asset_id, type_id, brand, model, bought_on, ram, processor, screen_size, os, storage_capacity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.query(query, [
            asset_id, type_id, brand, model, bought_on, 
            ram, processor, screen_size, os, storage_capacity
        ]);
        
        res.status(201).json({ message: "Asset registered successfully" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Asset ID already exists!" });
        }
        res.status(500).json({ error: err.message });
    }
};
exports.getAssetsByType = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM assets WHERE type_id = ? ORDER BY asset_id ASC', 
            [req.params.typeId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createAssetType = async (req, res) => {
    const { name } = req.body;
    try {
        await pool.query('INSERT INTO asset_types (name) VALUES (?)', [name]);
        res.status(201).json({ message: "Asset type added successfully" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "This asset type already exists." });
        }
        res.status(500).json({ error: err.message });
    }
};


exports.getAssetDetails = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM assets WHERE asset_id = ?', [req.params.assetId]);
        if (rows.length === 0) return res.status(404).json({ error: "Asset not found" });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAssetHistory = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT employee_id, employee_name, DATE_FORMAT(from_date, '%Y-%m-%d') as from_date, 
             DATE_FORMAT(to_date, '%Y-%m-%d') as to_date, remarks 
             FROM assignment_history WHERE asset_id = ? ORDER BY id DESC`, [req.params.assetId]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.reassignAsset = async (req, res) => {
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
    } finally { connection.release(); }
};
//----------------------
// 1. Updated getAssetsByTypeName (Cleaned)
exports.getAssetsByTypeName = async (req, res) => {
    const { typeName } = req.params;
    try {
        const query = `
            SELECT 
                a.asset_id, 
                at.name as asset_type, 
                ah.employee_id, 
                ah.employee_name, 
                DATE_FORMAT(ah.from_date, '%Y-%m-%d') as assign_date
            FROM assets a
            JOIN asset_types at ON a.type_id = at.id
            LEFT JOIN assignment_history ah ON a.asset_id = ah.asset_id AND ah.to_date IS NULL
            WHERE at.name = ?
        `;
        const [rows] = await pool.query(query, [typeName]);
        res.json(rows);
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ error: "Database query failed" });
    }
};

// 2. Updated getAssetDetailsByCategory (Cleaned and Fixed)
exports.getAssetDetailsByCategory = async (req, res) => {
    const { typeName } = req.params;
    try {
        const query = `
            SELECT 
                a.asset_id, 
                a.brand, 
                a.model, 
                ah.employee_id, 
                ah.employee_name, 
                DATE_FORMAT(ah.from_date, '%Y-%m-%d') as assign_date
            FROM assets a
            JOIN asset_types at ON a.type_id = at.id
            LEFT JOIN assignment_history ah ON a.asset_id = ah.asset_id AND ah.to_date IS NULL
            WHERE at.name = ?
        `;
        const [rows] = await pool.query(query, [typeName]);
        res.status(200).json(rows);
    } catch (err) {
        console.error("SQL Error Details:", err.message); 
        res.status(500).json({ error: "Database query failed" });
    }
};

exports.assignNewAsset = async (req, res) => {
    const { 
        asset_id, brand, model, typeName, 
        ram, processor, screen_size, os, storage_capacity, 
        employee_id, employee_name, from_date 
    } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [typeRow] = await connection.query('SELECT id FROM asset_types WHERE name = ?', [typeName]);
        if (typeRow.length === 0) throw new Error("Category not found");
        const type_id = typeRow[0].id;
        await connection.query(
            `INSERT INTO assets 
            (asset_id, type_id, brand, model, ram, processor, screen_size, os, storage_capacity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [asset_id, type_id, brand, model, ram, processor, screen_size, os, storage_capacity]
        );

        await connection.query(
            'INSERT INTO assignment_history (asset_id, employee_id, employee_name, from_date) VALUES (?, ?, ?, ?)',
            [asset_id, employee_id, employee_name, from_date]
        );

        await connection.commit();
        res.status(201).json({ message: "Asset successfully registered and assigned" });
    } catch (err) {
        await connection.rollback();
        console.error("Assignment Error:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};