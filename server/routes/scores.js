const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. RECORD A SCORE
router.post('/', async (req, res) => {
    try {
        const { student_id, subject_id, exam_type, marks } = req.body;

        if (marks < 0 || marks > 100) {
            return res.status(400).json({ error: "Invalid entry: Marks must be between 0 and 100." });
        }

        const newScore = await pool.query(
            "INSERT INTO scores (student_id, subject_id, exam_type, marks) VALUES ($1, $2, $3, $4) RETURNING *",
            [student_id, subject_id, exam_type, marks]
        );

        res.status(201).json(newScore.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({
                error: "Duplicate Submission: A score for this student, subject, and exam type already exists."
            });
        }
        res.status(500).json({ error: "Server error recording score." });
    }
});

// 2. READ: Fetch all scores with human-readable names via JOIN
router.get('/', async (req, res) => {
    try {
        const allScores = await pool.query(`
            SELECT 
                scores.id, scores.marks, scores.exam_type,
                students.first_name, students.last_name, students.admission_number,
                subjects.name AS subject_name, subjects.code AS subject_code
            FROM scores
            JOIN students ON scores.student_id = students.id
            JOIN subjects ON scores.subject_id = subjects.id
            ORDER BY students.last_name ASC, subjects.name ASC
        `);
        res.json(allScores.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error fetching scores." });
    }
});

// 3. DELETE: Drop a score record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM scores WHERE id = $1", [id]);
        res.json({ message: "Score deleted successfully." });
    } catch (err) {
        res.status(500).json({ error: "Server error deleting score." });
    }
});

module.exports = router;