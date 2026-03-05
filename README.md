# HRMS - Human Resource Management System

A production-ready HRMS application with Django REST API backend and React frontend.

## Features

- **Employee Management** - Add/view/edit/delete employees with auto-generated IDs
- **Attendance Tracking** - Mark & manage employee attendance with date filters
- **Statistics** - Real-time employee & attendance statistics with optimized queries
- **REST API** - Paginated endpoints with rate limiting & throttling
- **Modern UI** - React 19 + Tailwind CSS with responsive design
- **Fast Development** - Vite with hot module replacement
- **Security** - CORS, CSRF protection, production-ready settings

---

## Tech Stack

**Backend**: Django 4.2, Django REST Framework, SQLite  
**Frontend**: React 19, Vite 7, Tailwind CSS 3, Axios  
**Runtime**: Python 3.8+, Node.js 22+

---

## Quick Start

### Backend Setup
```bash
cd Backend
python3 -m venv myenv
source myenv/bin/activate
pip install -r requirements.txt
cd mainproj
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
source ~/.nvm/nvm.sh && nvm use 22
npm install
npm run dev
```

Access: `http://localhost:5173`

---

## API Endpoints

**Base URL**: `http://127.0.0.1:8000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/employees/` | List/create employees |
| GET/PUT/DELETE | `/employees/{id}/` | Retrieve/update/delete employee |
| GET | `/employees/{id}/statistics/` | Get employee attendance stats |
| GET | `/statistics/all/` | Get all employees statistics |
| POST | `/attendance/` | Create attendance record |
| GET | `/attendance/list/` | List attendance (supports filters) |

### Query Parameters
- `search` - Search by employee ID or name
- `employee_id` - Filter by employee ID
- `start_date`, `end_date` - Filter by date range (YYYY-MM-DD)
- `status` - Filter by status (present/absent)

---

## Environment Variables

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://127.0.0.1:8000/api
```

**Backend** (set in `mainproj/settings.py`):
```
DJANGO_SECRET_KEY - Secret key for session signing
DJANGO_DEBUG - Debug mode (True/False)
DJANGO_ALLOWED_HOSTS - Allowed hosts (comma-separated)
CORS_ALLOWED_ORIGINS - CORS allowed origins
```

---

## Development

- **Hot Reload**: Backend auto-reloads on changes, Frontend has Vite HMR
- **Styling**: Tailwind CSS with hot reload
- **Linting**: `npm run lint` (frontend)

---

## Production

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) and [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)

---

## Troubleshooting

**Node version error**: `source ~/.nvm/nvm.sh && nvm use 22`

**Port in use**: `lsof -i :8000` or `lsof -i :5173`

**CORS errors**: Verify `CORS_ALLOWED_ORIGINS` in settings

**DB errors**: `python manage.py migrate`

---

**Status**: ✅ Production Ready | Last Updated: March 2026
