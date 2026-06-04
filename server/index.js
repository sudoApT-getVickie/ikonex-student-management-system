const express = require('express');
const cors = require('cors');
const pool = require('./db'); // db pool, hope it doesn't crash on us
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// cors and json body parsing stuff
app.use(cors());
app.use(express.json());

// just a quick route to make sure backend is actually running 
app.get('/', (req, res) => {
    res.json({ message: "Ikonex SMS Backend is running!" });
});

//stream routes
const streamRoutes = require('./routes/streams');
app.use('/api/streams', streamRoutes);

//student routes
const studentRoutes = require('./routes/students');
app.use('/api/students', studentRoutes);

//subject routes & the scores
const subjectRoutes = require('./routes/subjects');
const scoreRoutes = require('./routes/scores');

app.use('/api/subjects', subjectRoutes);
app.use('/api/scores', scoreRoutes);

// start the server
app.listen(PORT, () => {
    console.log(`Server is blasting off on port ${PORT}`);
});
