const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        const newStream = await pool.query(
            "INSERT INTO streams (name) VALUES ($1) RETURNING *",
            [name]
        );

        res.status(201).json(newStream.rows[0]);
    } catch (err) {
        console.error(err.message);
        // code 23505 is duplicate key error in postgres 
        if (err.code === '23505') {
            return res.status(400).json({ error: "A class stream with this name already exists." });
        }
        res.status(500).json({ error: "Server error" });
    }
});

router.get('/', async (req, res) => {
    try {
        const allStreams = await pool.query("SELECT * FROM streams ORDER BY name ASC");
        res.json(allStreams.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const stream = await pool.query("SELECT * FROM streams WHERE id = $1", [id]);

        // return 404 if we didn't find anything in db
        if (stream.rows.length === 0) {
            return res.status(404).json({ error: "Stream not found" });
        }

        res.json(stream.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
