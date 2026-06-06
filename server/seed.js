const pool = require('./db');

// --- RAW DATA DICTIONARIES ---
const STREAMS = [
    { code: 'F1-A', name: 'Form 1 Antelope' }, { code: 'F1-B', name: 'Form 1 Buffalo' },
    { code: 'F1-C', name: 'Form 1 Cheetah' }, { code: 'F1-D', name: 'Form 1 Dolphin' },
    { code: 'F2-A', name: 'Form 2 Antelope' }, { code: 'F2-B', name: 'Form 2 Buffalo' },
    { code: 'F2-C', name: 'Form 2 Cheetah' }, { code: 'F2-D', name: 'Form 2 Dolphin' },
    { code: 'F3-A', name: 'Form 3 Antelope' }, { code: 'F3-B', name: 'Form 3 Buffalo' },
    { code: 'F3-C', name: 'Form 3 Cheetah' }, { code: 'F3-D', name: 'Form 3 Dolphin' },
    { code: 'F4-A', name: 'Form 4 Antelope' }, { code: 'F4-B', name: 'Form 4 Buffalo' },
    { code: 'F4-C', name: 'Form 4 Cheetah' }, { code: 'F4-D', name: 'Form 4 Dolphin' }
];

const SUBJECTS = [
    { name: 'Mathematics', code: 'MAT-101' },
    { name: 'English Language', code: 'ENG-101' },
    { name: 'Kiswahili', code: 'KIS-101' },
    { name: 'Biology', code: 'BIO-201' },
    { name: 'Chemistry', code: 'CHE-201' },
    { name: 'Physics', code: 'PHY-201' },
    { name: 'Geography', code: 'GEO-301' },
    { name: 'History & Government', code: 'HIS-301' },
    { name: 'Christian Religious Ed', code: 'CRE-301' },
    { name: 'Agriculture', code: 'AGR-401' },
    { name: 'Business Studies', code: 'BUS-401' }
];

const FIRST_NAMES = ['Kamau', 'Wanjiku', 'Ochieng', 'Akinyi', 'Muthomi', 'Kipchoge', 'Fatuma', 'Naliaka', 'Mutua', 'Mwende', 'Odhiambo', 'Wanjiru', 'Kariuki', 'Njoroge', 'Nyambura'];
const LAST_NAMES = ['Odinga', 'Kenyatta', 'Kasongo', 'Mwangi', 'Otieno', 'Wanjala', 'Ndungu', 'Kimani', 'Maina', 'Kiprop', 'Onyango', 'Mutuku', 'Waweru', 'Koech', 'Hassan'];

// --- AUTOMATION ENGINE ---
async function seedDatabase() {
    try {
        console.log("⏳ [1/6] Initiating Database Wipe...");
        // WARNING: This completely empties the database to ensure a clean slate
        await pool.query("TRUNCATE TABLE scores, stream_subjects, students, subjects, streams RESTART IDENTITY CASCADE");
        console.log("✅ Database wiped cleanly.");

        console.log("⏳ [2/6] Seeding Class Streams...");
        const streamIds = [];
        for (const stream of STREAMS) {
            // NEW: Inserting the stream_code alongside the name
            const res = await pool.query(
                "INSERT INTO streams (stream_code, name) VALUES ($1, $2) RETURNING id",
                [stream.code, stream.name]
            );
            streamIds.push(res.rows[0].id);
        }

        console.log("⏳ [3/6] Seeding Academic Subjects...");
        const subjectIds = [];
        for (const sub of SUBJECTS) {
            const res = await pool.query("INSERT INTO subjects (name, code) VALUES ($1, $2) RETURNING id", [sub.name, sub.code]);
            subjectIds.push(res.rows[0].id);
        }

        console.log("⏳ [4/6] Mapping Subjects to Streams (Junction Table)...");
        for (const streamId of streamIds) {
            for (const subjectId of subjectIds) {
                await pool.query("INSERT INTO stream_subjects (stream_id, subject_id) VALUES ($1, $2)", [streamId, subjectId]);
            }
        }

        console.log("⏳ [5/6] Enrolling 80 Synthetic Students...");
        const studentRecords = [];
        let admissionCounter = 1000;

        for (const streamId of streamIds) {
            // Put exactly 5 students in each of the 16 streams = 80 students
            for (let i = 0; i < 5; i++) {
                const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
                const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
                const admNo = `IKX-${admissionCounter++}`;

                const res = await pool.query(
                    "INSERT INTO students (first_name, last_name, admission_number, stream_id) VALUES ($1, $2, $3, $4) RETURNING id",
                    [fName, lName, admNo, streamId]
                );
                studentRecords.push({ id: res.rows[0].id, stream_id: streamId });
            }
        }

        console.log("⏳ [6/6] Generating Mid-Term Exam Scores...");
        // Give every student a score for every subject they take
        for (const student of studentRecords) {
            for (const subjectId of subjectIds) {
                // Generate a weighted random score between 35 and 95
                const randomMarks = Math.floor(Math.random() * (95 - 35 + 1)) + 35;
                await pool.query(
                    "INSERT INTO scores (student_id, subject_id, exam_type, marks) VALUES ($1, $2, $3, $4)",
                    [student.id, subjectId, 'MID-TERM', randomMarks]
                );
            }
        }

        console.log("🎉 SEEDING COMPLETE! The Academy is fully populated.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    }
}

seedDatabase();