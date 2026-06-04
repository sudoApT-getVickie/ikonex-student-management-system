const express = require('express');
const router = express.Router();
const pool = require('../db');

// CREATE A SUBJECT
router.post('/', async (req, res) => {
    try {
        const { name, code } = req.body; // e.g., "Mathematics", "MAT-101"
        const newSubject = await pool.query(
            "INSERT INTO subjects (name, code) VALUES ($1, $2) RETURNING *",
            [name, code]
        );
        res.status(201).json(newSubject.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: "A subject with this name or code already exists." });
        }
        res.status(500).json({ error: "Server error" });
    }
});

// VIEW ALL SUBJECTS
router.get('/', async (req, res) => {
    try {
        const allSubjects = await pool.query("SELECT * FROM subjects ORDER BY name ASC");
        res.json(allSubjects.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;