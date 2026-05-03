# Industrial Attachment Management System (IAMS)

Groupmembers
1.Uakambura Vitore – 202206392
2.Thando Fino – 202201524
3.Thabang Tsimakwane – 202302165
4.Phenyo Morapedi – 202105212
5.Angel Tshukudu – 202301115

IAMS is a web-based system for managing the industrial attachment process. It supports:

- user registration and login with roles
- student profile and preference capture
- organization profile and preference capture
- coordinator dashboard and organization approval
- automated student-to-organization matching
- manual match override by a coordinator
- match notifications

## Tech Stack

- Backend: Django + Django REST Framework
- Frontend: React
- Database: SQLite by default, PostgreSQL when `DATABASE_URL` or `DB_*` environment variables are provided

## Prerequisites

- Python 3.11 or later
- Node.js 18 or later
- npm

## 1. Clone and Open the Project

```powershell
git clone <your-repository-url>
cd Industrial-Attachment-Management-System-IAMS-
```

## 2. Backend Setup

Create a virtual environment:

```powershell
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

## 3. Environment Variables

Create a `.env` file in the project root if it does not already exist:

```env
SECRET_KEY=local-dev-secret-key-change-me
DEBUG=True
DATABASE_URL=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=5432
```

Notes:

- If `DATABASE_URL` is set, Django will use it first.
- If `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_HOST` are filled, Django will use that PostgreSQL connection.
- If neither PostgreSQL option is configured, the system falls back to the local SQLite database automatically.
- Email notifications use Django's local email backend unless you configure SMTP separately.

## 4. Apply Migrations

From the project root, run:

```powershell
python manage.py migrate
```

## 5. Create an Admin User

This lets you log into Django admin and manage users and other system data.

```powershell
python manage.py createsuperuser
```

## 6. Start the Backend

Run the Django development server from the project root:

```powershell
python manage.py runserver
```

Backend URLs:

- App API: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- Django admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

## 7. Frontend Setup

Open a second terminal, then go to the frontend folder:

```powershell
cd frontend
```

Install frontend dependencies:

```powershell
npm install
```

Start the React development server:

```powershell
npm start
```

Frontend URL:

- Web app: [http://localhost:3000/](http://localhost:3000/)

## 8. Student Registration Flow

Students now register for industrial attachment through the student registration portal, then sign in to IAMS and complete their profile inside the system.

That means:

- student registration starts in the student registration portal at `/asas/register`
- a student account is created with `username`, `email`, `password`, and `student_id`
- after student registration, the student is redirected to the IAMS sign-in page
- once signed in, the student completes the rest of the profile in the student setup page
- the student profile keeps using the same `student_id` that was provided during attachment registration

## 9. Running Without Activating the Virtual Environment

If you prefer not to activate the environment, you can run backend commands directly:

```powershell
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py runserver
```

## 10. Useful Commands

Run backend checks:

```powershell
python manage.py check
```

Run backend tests:

```powershell
python manage.py test
```

Build the frontend for production:

```powershell
cd frontend
npm run build
```

## 11. Deploying to Render

This repository is now prepared for a Render Blueprint deployment with:

- a Django web service for the API
- a React static site for the frontend
- a Render Postgres database for persistent relational data

### Recommended path

1. Push this repository to GitHub.
2. In Render, open Blueprints and create a new Blueprint instance from the repository.
3. Render will read `render.yaml` and prepare these resources:
   - `industrial-attachment-ams-api`
   - `industrial-attachment-ams-web`
   - `industrial-attachment-ams-db`
4. When prompted, provide:
   - `DJANGO_SUPERUSER_USERNAME`
   - `DJANGO_SUPERUSER_EMAIL`
   - `DJANGO_SUPERUSER_PASSWORD`
5. Apply the blueprint and wait for the initial deploy to finish.

### What happens automatically

- the backend runs migrations during deploy
- the backend creates or updates a coordinator/superuser account from the `DJANGO_SUPERUSER_*` variables
- the frontend build receives the backend Render URL automatically
- the backend CORS list receives the deployed frontend URL automatically

### Lecturer review URLs

After deployment:

- frontend app: the `industrial-attachment-ams-web` Render URL
- backend admin: the `industrial-attachment-ams-api` Render URL with `/admin/`
- API base: the `industrial-attachment-ams-api` Render URL with `/api/`

### Important Render notes

- The production deployment uses Render Postgres because Render web services have an ephemeral filesystem and local SQLite is not persistent there.
- Student CV uploads are still stored on the web service filesystem. Those uploaded files can be lost when the service restarts, redeploys, or spins down.
- According to Render's current free-tier docs, free web services spin down after 15 minutes of inactivity, and free Postgres databases expire 30 days after creation. If you create the database on April 16, 2026, it would expire around May 16, 2026 unless you upgrade it.

## 12. Project Structure

- `accounts/` - authentication, roles, and account registration
- `students/` - student profiles and preferences
- `organizations/` - organization profiles and approval
- `dashboard/` - coordinator dashboard APIs
- `matching/` - matching engine, suggestions, assignments, notifications
- `frontend/` - React user interface

## Quick Start Summary

If you already have Python and Node installed, the shortest path is:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

In another terminal:

```powershell
cd frontend
npm install
npm start
```

Then open:

- Frontend: [http://localhost:3000/](http://localhost:3000/)
- Backend admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
