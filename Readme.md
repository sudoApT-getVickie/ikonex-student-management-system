# Ikonex Academy - Student Management System (SMS)

A comprehensive, full-stack Student Management System developed for Ikonex Academy. This platform digitizes academic administration, from student enrollment and cohort management to automated grading and PDF report generation.

## Project Objective
To provide a robust, web-based management solution that streamlines academic operations, enhances data accuracy, and provides instant analytical insights into student and class performance.

## Tech Stack & Architecture
This project utilizes a decoupled monorepo architecture:
* **Frontend:** React (Vite), Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Deployment Architecture:** Vercel (Client) & Railway (API & Database)

###  Production Testing Note
The application is fully deployed and production-ready at [ikonex-student-management-system.vercel.app](https://ikonex-student-management-system.vercel.app/).

**Network & Environment Compatibility:**
* The frontend and backend architectures communicate entirely over secure cloud protocols.
* In rare instances, strict corporate firewalls, local network DNS configurations, or strict browser privacy extensions (such as aggressive ad-blockers) may intercept client-side database handshakes.

**Recommended Testing Environment:** For an uninterrupted evaluation, please access the live URL using a standard, un-firewalled network (MOBILE-DATA) or via an Incognito/Private window with extensions disabled. 

https://github.com/user-attachments/assets/7046ea6a-919a-41da-8254-46021610a218



---

## Core Functional Modules

### 1. Cohort & Stream Management
* Initialize and manage class streams (e.g., Form 1A, Form 1B).
* Assign Class Teachers and view aggregated class performance dossiers.

### 2. Student Roster
* Register students and assign admission numbers.
* Allocate students to specific class streams.
* Full CRUD capabilities for student records.

### 3. Curriculum & Subject Mapping
* Create academic subjects with unique identifier codes.
* Map specific subjects to class streams for targeted grading.

### 4. Assessment & Analytics Engine
* Record and update continuous assessment scores per student, per subject.
* Built-in validation to prevent duplicate score entries.
* Automated Results Processing: Calculates total marks, average scores, and assigns grades based on configurable scales.
* Algorithmic ranking for individual subject positions and overall stream rankings.

### 5. Print Center (Reporting)
* Generate automated, downloadable PDF Report Cards for individual students.
* Compile and export PDF class performance reports.

---

## Setup & Local Development Guide

### Prerequisites
* Node.js (v18+)
* PostgreSQL running locally or via a cloud provider.
* Git

### 1. Clone the Repository
\`\`\`bash
git clone <YOUR_GITHUB_REPO_URL>
cd ikonex-student-management-system
\`\`\`

### 2. Backend Initialization (API)
Navigate to the server directory, install dependencies, and configure the environment:
\`\`\`bash
cd server
npm install
\`\`\`
Create a `.env` file in the `/server` directory:
\`\`\`env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/ikonex_db
PORT=5000
\`\`\`
Seed the database with initial structural data (Streams & Subjects) and start the server:
\`\`\`bash
node seed.js
npm start
\`\`\`

### 3. Frontend Initialization (Client)
Open a new terminal window, navigate to the client directory, and install dependencies:
\`\`\`bash
cd client
npm install
\`\`\`
Create a `.env` file in the `/client` directory:
\`\`\`env
VITE_API_URL=http://localhost:5000
\`\`\`
Start the Vite development server:
\`\`\`bash
npm run dev
\`\`\`

---

## Deployment Guide

This application is configured for cloud deployment using a split-hosting strategy.

### Backend Deployment (Railway)
1. Connect the GitHub repository to a new Railway Web Service.
2. Configure the **Root Directory** to `/server`.
3. Provision a PostgreSQL database within the same Railway project.
4. Inject the internal `DATABASE_URL` into the Web Service environment variables.
5. Set the Custom Start Command to `node index.js`.

### Frontend Deployment (Vercel)
1. Import the repository into Vercel.
2. Vercel will automatically detect the Vite/React configuration within the `/client` directory via the `vercel.json` routing rules.
3. Add the `VITE_API_URL` environment variable, pointing to the live Railway Web Service URL.
4. Deploy the application.

---

## Brief System Usage Guide

1.  **System Initialization:** Upon first launch, navigate to the **Academic Subjects** and **Class Streams** tabs to establish the school's foundational data.
2.  **Student Enrollment:** Use the **Students Roster** to register students and assign them to the newly created streams.
3.  **Data Entry:** Navigate to **Performance Logs** to input exam scores. The system will automatically link available subjects to the selected student based on their stream.
4.  **Analytics:** View the **Dashboard** for top-level metrics, or click "View Dossier" under Class Streams to see algorithmic rankings and top performers.
5.  **Reporting:** Use the **Print Center** to instantly generate PDF report cards for distribution.
