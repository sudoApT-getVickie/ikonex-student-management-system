const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, stream_id } = req.body;
        
        const newStudent = await pool.query(
            "INSERT INTO students (first_name, last_name, stream_id) VALUES ($1, $2, $3) RETURNING *",
            [first_name, last_name, stream_id]
        );
        
        res.status(201).json(newStudent.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error during student registration" });
    }
});

router.get('/', async (req, res) => {
    try {
        // join tables so we get the stream name, not just ID
        const allStudents = await pool.query(`
            SELECT students.id, students.first_name, students.last_name, streams.name AS stream_name 
            FROM students 
            LEFT JOIN streams ON students.stream_id = streams.id
            ORDER BY students.last_name ASC
        `);
        res.json(allStudents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
