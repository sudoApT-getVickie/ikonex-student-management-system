const express = require('express');
const router = express.Router();
const pool = require('../db');

// RECORD A SCORE
router.post('/', async (req, res) => {
    try {
        const { student_id, subject_id, exam_type, marks } = req.body;

        // 1st Line of Defense: Backend Validation
        if (marks < 0 || marks > 100) {
            return res.status(400).json({ error: "Invalid entry: Marks must be between 0 and 100." });
        }

        // Execute Insert
        const newScore = await pool.query(
            "INSERT INTO scores (student_id, subject_id, exam_type, marks) VALUES ($1, $2, $3, $4) RETURNING *",
            [student_id, subject_id, exam_type, marks]
        );

        res.status(201).json(newScore.rows[0]);
    } catch (err) {
        console.error(err.message);

        // 2nd Line of Defense: Catching the Database Duplicate Constraint
        if (err.code === '23505') {
            return res.status(400).json({
                error: "Duplicate Submission: A score for this student, subject, and exam type has already been recorded."
            });
        }
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;