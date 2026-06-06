const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. CREATE: Initialize a new class stream
router.post('/', async (req, res) => {
    try {
        // NEW: Destructuring stream_code
        const { stream_code, name, class_teacher } = req.body;

        // Auto-format the code to be strictly uppercase with no spaces
        const formattedCode = stream_code.toUpperCase().replace(/\s+/g, '-');

        const newStream = await pool.query(
            "INSERT INTO streams (stream_code, name, class_teacher) VALUES ($1, $2, $3) RETURNING *",
            [formattedCode, name, class_teacher || 'Unassigned']
        );
        res.status(201).json(newStream.rows[0]);
    } catch (err) {
        // Catching the UNIQUE constraint violation on stream_code
        if (err.code === '23505') return res.status(400).json({ error: "A stream with this exact code already exists." });
        res.status(500).json({ error: "Server error." });
    }
});

// 2. READ ALL: Basic list for dropdowns
router.get('/', async (req, res) => {
    try {
        const allStreams = await pool.query("SELECT * FROM streams ORDER BY name ASC");
        res.json(allStreams.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error." });
    }
});

// 3. AGGREGATION: The Class Dossier Endpoint
router.get('/:id/details', async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch Base Stream Info
        const streamRes = await pool.query("SELECT * FROM streams WHERE id = $1", [id]);
        if (streamRes.rows.length === 0) return res.status(404).json({ error: "Stream not found." });
        const streamInfo = streamRes.rows[0];

        // Fetch Live Enrollment Count
        const countRes = await pool.query("SELECT COUNT(*) FROM students WHERE stream_id = $1", [id]);
        const enrollment = parseInt(countRes.rows[0].count);

        // Fetch Assigned Subjects via Junction Table
        const subjectsRes = await pool.query(`
            SELECT subjects.code, subjects.name 
            FROM subjects 
            JOIN stream_subjects ON subjects.id = stream_subjects.subject_id 
            WHERE stream_subjects.stream_id = $1
            ORDER BY subjects.name ASC
        `, [id]);

        // Calculate Top 3 Performers
        const topPerformersRes = await pool.query(`
            SELECT students.first_name, students.last_name, students.admission_number, 
                   ROUND(AVG(scores.marks), 1) as average
            FROM students
            JOIN scores ON students.id = scores.student_id
            WHERE students.stream_id = $1
            GROUP BY students.id
            ORDER BY average DESC
            LIMIT 3
        `, [id]);

        // Bundle and send
        res.json({
            ...streamInfo,
            enrollment,
            subjects: subjectsRes.rows,
            topPerformers: topPerformersRes.rows
        });

    } catch (err) {
        res.status(500).json({ error: "Server error generating dossier." });
    }
});

// 4. DELETE: Drop a stream
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM streams WHERE id = $1", [id]);
        res.json({ message: "Stream deleted." });
    } catch (err) {
        res.status(500).json({ error: "Server error." });
    }
});

module.exports = router;

// 5. UPDATE: Modify an existing stream's details
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { stream_code, name, class_teacher } = req.body;

        const formattedCode = stream_code.toUpperCase().replace(/\s+/g, '-');

        const updateRes = await pool.query(
            "UPDATE streams SET stream_code = $1, name = $2, class_teacher = $3 WHERE id = $4 RETURNING *",
            [formattedCode, name, class_teacher || 'Unassigned', id]
        );

        if (updateRes.rows.length === 0) return res.status(404).json({ error: "Stream not found." });
        res.json(updateRes.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: "Another stream is already using this code." });
        res.status(500).json({ error: "Server error." });
    }
});