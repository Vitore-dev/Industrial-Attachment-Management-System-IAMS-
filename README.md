# Industrial Attachment Management System (IAMS)

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
- Database: SQLite by default, PostgreSQL when `DB_*` environment variables are provided

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
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=5432
```

Notes:

- If `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_HOST` are left empty, the system uses the local SQLite database automatically.
- If you want PostgreSQL, fill in those values and Django will use PostgreSQL instead.
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

Students now register for industrial attachment through the simulated ASAS student management portal, then sign in to IAMS and complete their profile inside the system.

That means:

- student registration starts on the ASAS portal at `/asas/register`
- a student account is created with `username`, `email`, `password`, and `student_id`
- after ASAS registration, the student is redirected to the IAMS sign-in page
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

## 11. Project Structure

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
