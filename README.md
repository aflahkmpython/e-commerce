# Ecommerce Full Stack Project

A modern ecommerce web application built with **React (Vite)** and **Django (DRF)**.

## Project Structure

- `frontend/`: React application using Vite, Tailwind CSS, Redux Toolkit, and Framer Motion.
- `backend/`: Django project with REST Framework, CORS configuration, and environment-specific settings.

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js & npm (for frontend)

### Backend Setup

1.  `cd backend`
2.  `python -m venv venv`
3.  `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4.  `pip install -r requirements.txt`
5.  Create a `.env` file from the template:
    ```env
    SECRET_KEY=your_secret_key
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1
    DB_NAME=ecommerce_db
    DB_USER=root
    DB_PASSWORD=password
    DB_HOST=localhost
    DB_PORT=3306
    ```
6.  `python manage.py migrate`
7.  `python manage.py runserver`

### Frontend Setup

1.  `cd frontend`
2.  `npm install`
3.  `npm run dev`

## API Endpoints

- **Health Check**: `GET /api/health/` - Returns `{"status": "ok"}`

## Environment Configuration

The Django project uses split settings:
- `core/settings/base.py`: Common configurations.
- `core/settings/dev.py`: Development settings (SQLite).
- `core/settings/prod.py`: Production settings (MySQL, credentials via `.env`).
