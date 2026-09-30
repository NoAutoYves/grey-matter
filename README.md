# Grey Matter

A free interactive practice platform for South African high school learners in
Grades 10, 11 and 12. Students work through 10-question multiple-choice
exercises across 8 subjects, get instant feedback, save notes, and track
progress over time.

Live: [greymatterschool.co.za](https://greymatterschool.co.za)

## Subjects

Accounting · Business Studies · Economics · Geography · Life Science ·
Physical Sciences · Mathematical Literacy · Mathematics

## Features

- 10-question exercises with instant per-answer feedback
- Full per-question breakdown at the end of every exercise
- Chapter notes attached to every topic, plus space for your own notes
- Progress tracking across every attempt
- Retake any exercise as many times as you want
- User profiles with avatar upload
- Free, with no paywall

## Tech stack

- **Frontend:** React 19 + Vite 8, deployed as static HTML via nginx
- **Backend:** Flask + PostgreSQL, served by gunicorn
- **Auth:** Session cookies with Werkzeug password hashing
- **Prerender:** Puppeteer captures all public routes to static HTML at build time

## Architecture notes

The frontend is a single-page app, but every public route is prerendered to
static HTML during `npm run build`. This is what makes the site crawlable by
Google and indexable by AdSense.

- Public routes (prerendered): landing page, subject pages, all 273 topic
  pages, and static info pages - 291 routes total.
- Protected routes (not prerendered): exercise-taking, results, profile, and
  admin.

## Local development

### Backend

```bash
cd grey-matter-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python App.py
```

Runs at `http://localhost:5000`. Requires a local PostgreSQL database and a
`.env` file with credentials.

### Frontend

```bash
cd greymatter-frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`. Vite proxies `/api`, `/auth`, and `/uploads`
to `localhost:5000`, so the backend must be running.

Node 20.19+ or 22.12+ required.

## Adding exercises

Insert SQL against `topics`, `exercises`, and `questions` directly. New
exercises appear on the live site immediately and are added to the
prerendered HTML on the next build.

Math and Physics questions use KaTeX syntax - wrap formulas in `$...$`
inline, `$$...$$` for display, and never escape backslashes.

## License

Proprietary. Copyright Grey Matter. All rights reserved.
