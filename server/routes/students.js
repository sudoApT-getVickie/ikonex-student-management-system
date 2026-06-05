const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. CREATE: Register a new student with Admission Number
router.post('/', async (req, res) => {
    try {
        const { admission_number, first_name, last_name, stream_id } = req.body;

        const newStudent = await pool.query(
            "INSERT INTO students (admission_number, first_name, last_name, stream_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [admission_number, first_name, last_name, stream_id]
        );

        res.status(201).json(newStudent.rows[0]);
    } catch (err) {
        console.error(err.message);
        // Catch Database Duplicate Constraint
        if (err.code === '23505') {
            return res.status(400).json({ error: "A student with this Admission Number is already registered." });
        }
        res.status(500).json({ error: "Server error during student registration." });
    }
});

// 2. READ: Get all students
router.get('/', async (req, res) => {
    try {
        const allStudents = await pool.query(`
            SELECT students.id, students.admission_number, students.first_name, students.last_name, students.stream_id, streams.name AS stream_name 
            FROM students 
            LEFT JOIN streams ON students.stream_id = streams.id
            ORDER BY students.last_name ASC
        `);
        res.json(allStudents.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error fetching students." });
    }
});

// 3. READ: Get a single student by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const student = await pool.query(`
            SELECT students.id, students.admission_number, students.first_name, students.last_name, students.stream_id, streams.name AS stream_name 
            FROM students 
            LEFT JOIN streams ON students.stream_id = streams.id
            WHERE students.id = $1
        `, [id]);

        if (student.rows.length === 0) return res.status(404).json({ error: "Student not found." });
        res.json(student.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error fetching student details." });
    }
});

// 4. UPDATE: Edit a student's information
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { admission_number, first_name, last_name, stream_id } = req.body;

        const updateStudent = await pool.query(
            "UPDATE students SET admission_number = $1, first_name = $2, last_name = $3, stream_id = $4 WHERE id = $5 RETURNING *",
            [admission_number, first_name, last_name, stream_id, id]
        );

        if (updateStudent.rows.length === 0) return res.status(404).json({ error: "Student not found." });
        res.json(updateStudent.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: "Admission Number is already in use by another student." });
        }
        res.status(500).json({ error: "Server error during student update." });
    }
});

// 5. DELETE: Remove a student
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteStudent = await pool.query("DELETE FROM students WHERE id = $1 RETURNING *", [id]);

        if (deleteStudent.rows.length === 0) return res.status(404).json({ error: "Student not found." });
        res.json({ message: "Student dropped from roster." });
    } catch (err) {
        res.status(500).json({ error: "Server error during student deletion." });
    }
});

module.exports = router;