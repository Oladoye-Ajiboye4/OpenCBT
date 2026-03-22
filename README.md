# OpenCBT - Enterprise Examination and AI Proctoring Platform

OpenCBT is a high-security, zero-trust Computer-Based Testing (CBT) system designed for academic institutions. It features automated student provisioning, real-time ML-driven proctoring, and a strict multi-tier result publication workflow.

## Key Features

- Zero-Trust Exam Hall: Secure testing environment with tab-switch tracking, fullscreen enforcement, and clipboard/interaction lockdowns.
- Live AI Proctoring: Client-side machine learning (TensorFlow.js and BlazeFace) continuously monitors the student's webcam for missing faces, multiple faces, and poor lighting conditions.
- Lecturer Command Center: Real-time telemetry dashboard where lecturers can view online students, network drop-offs, and photographic snapshot evidence of detected malpractice.
- Smart Auto-Provisioning: Lecturers can sync course rosters and automatically dispatch unique 6-digit one-time exam pins to students via email.
- Secure Auto-Grading: Correct answers are never exposed to the browser. Grading is handled on the server upon submission to prevent client-side tampering.
- Multi-Tier Publication: Results follow a strict verification flow: PENDING -> APPROVED_BY_LECTURER -> PUBLISHED.

## Tech Stack

- Framework: Next.js (App Router)
- Database: PostgreSQL (Supabase)
- ORM: Prisma
- Authentication: Supabase Auth
- AI Vision: TensorFlow.js and BlazeFace
- Styling: Tailwind CSS and GSAP
- Email Dispatch: Nodemailer
- Validation: Zod

## Local Development Setup

1. Clone the repository:

```bash
git clone https://github.com/Oladoye-Ajiboye4/OpenCBT.git
cd OpenCBT
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `.env`:

- `DATABASE_URL`
- `DIRECT_URL`
- `SESSION_SECRET`
- `SMTP_USER`
- `SMTP_PASS`
- `NEXT_PUBLIC_BASE_URL`

4. Sync database schema and generate Prisma client:

```bash
npx prisma db push
npx prisma generate
```

5. Start the development server:

```bash
npm run dev
```

6. Open the app:

- http://localhost:3000

## Production Notes

- Set strong secrets for `SESSION_SECRET` and SMTP credentials.
- Use HTTPS in production to ensure secure cookie behavior.
- Rotate exam credentials and monitor proctoring logs routinely.

## License

Proprietary project for institutional deployment.
