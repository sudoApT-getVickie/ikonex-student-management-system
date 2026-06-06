const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. CREATE: Register a new subject
router.post('/', async (req, res) => {
    try {
        const { name, code } = req.body;
        const newSubject = await pool.query(
            "INSERT INTO subjects (name, code) VALUES ($1, $2) RETURNING *",
            [name, code]
        );
        res.status(201).json(newSubject.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: "A subject with this name or code already exists." });
        }
        res.status(500).json({ error: "Server error during subject creation." });
    }
});

// 2. READ: Get all subjects
router.get('/', async (req, res) => {
    try {
        const allSubjects = await pool.query("SELECT * FROM subjects ORDER BY name ASC");
        res.json(allSubjects.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error fetching subjects." });
    }
});

// 3. UPDATE: Edit a subject's details
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code } = req.body;

        const updateSubject = await pool.query(
            "UPDATE subjects SET name = $1, code = $2 WHERE id = $3 RETURNING *",
            [name, code, id]
        );

        if (updateSubject.rows.length === 0) return res.status(404).json({ error: "Subject not found." });
        res.json(updateSubject.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: "Subject code already in use." });
        res.status(500).json({ error: "Server error updating subject." });
    }
});

// 4. DELETE: Remove a subject from the system
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Thanks to ON DELETE CASCADE in the database, we don't need to manually delete assignments first.
        const deleteSubject = await pool.query("DELETE FROM subjects WHERE id = $1 RETURNING *", [id]);

        if (deleteSubject.rows.length === 0) return res.status(404).json({ error: "Subject not found." });
        res.json({ message: "Subject successfully deleted." });
    } catch (err) {
        res.status(500).json({ error: "Server error deleting subject." });
    }
});

// ==========================================
// JUNCTION ROUTING: STREAM-SUBJECT MAPPINGS
// ==========================================

// ASSIGN: Bind a subject to a specific stream
router.post('/assign', async (req, res) => {
    try {
        const { stream_id, subject_id } = req.body;

        const assignment = await pool.query(
            "INSERT INTO stream_subjects (stream_id, subject_id) VALUES ($1, $2) RETURNING *",
            [stream_id, subject_id]
        );
        res.status(201).json(assignment.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: "This subject is already assigned to this stream." });
        }
        res.status(500).json({ error: "Server error assigning subject." });
    }
});

// READ: Get all subjects assigned to a specific stream
router.get('/stream/:stream_id', async (req, res) => {
    try {
        const { stream_id } = req.params;
        const assignedSubjects = await pool.query(`
            SELECT subjects.id, subjects.name, subjects.code 
            FROM subjects 
            JOIN stream_subjects ON subjects.id = stream_subjects.subject_id 
            WHERE stream_subjects.stream_id = $1
            ORDER BY subjects.name ASC
        `, [stream_id]);

        res.json(assignedSubjects.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error fetching assigned subjects." });
    }
});

// DELETE: Remove a subject from a stream
router.delete('/unassign/:stream_id/:subject_id', async (req, res) => {
    try {
        const { stream_id, subject_id } = req.params;
        await pool.query(
            "DELETE FROM stream_subjects WHERE stream_id = $1 AND subject_id = $2",
            [stream_id, subject_id]
        );
        res.json({ message: "Subject unassigned from stream." });
    } catch (err) {
        res.status(500).json({ error: "Server error unassigning subject." });
    }
});

module.exports = router;