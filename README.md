# College Management System

A web application for managing college students and faculty using React, Django, and PostgreSQL.

## Features

- Faculty and student user roles
- Faculty can create, view, and update student profiles
- Faculty can add students to their subjects
- Students can view their profile and enrolled subjects
- Profile picture support for students
- Secure authentication system

## Prerequisites

- Python 3.12+
- Node.js 16+
- PostgreSQL

## Installation

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/sanjay-dastute/College-management.git
cd College-management
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install django djangorestframework django-cors-headers psycopg2-binary Pillow
```

4. Configure the database in `backend/settings.py`

5. Apply migrations:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

6. Create a superuser (for admin access):
```bash
python manage.py createsuperuser
```

7. Run the backend server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Usage

1. Access the Django admin interface at `http://localhost:8000/admin/` to create faculty users
2. Faculty can log in at `http://localhost:3000/login`
3. Faculty can:
   - Create new student accounts
   - View all students
   - Update student details
   - Add students to their subject

4. Students can:
   - Log in with their credentials
   - View their profile details
   - View their enrolled subjects and faculty

## API Endpoints

- `POST /api/api-auth/login/` - User authentication
- `GET /api/students/` - List all students (faculty only)
- `POST /api/students/` - Create new student (faculty only)
- `GET /api/students/{id}/` - Get student details
- `PUT /api/students/{id}/` - Update student details
- `POST /api/faculty/{id}/add_student/` - Add student to faculty

## Tech Stack

- Frontend: React with Chakra UI
- Backend: Django with Django REST Framework
- Database: PostgreSQL
- Authentication: Django Session Authentication
