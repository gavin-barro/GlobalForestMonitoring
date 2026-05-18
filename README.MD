# Global Forest Monitoring

Global Forest Monitoring is a full-stack web application for exploring forest and land-cover data, tracking region-specific statistics, and managing proposed data updates through a role-based workflow. It was developed as a database management final project and is structured around a FastAPI backend, a React + TypeScript frontend, and a relational database schema.

The application is designed for several user types:

- `Guest` users can browse public information and see high-level dashboards.
- `Viewer` users can search regions, save areas of interest, and monitor trends over time.
- `Researcher` users can analyze data and submit proposed updates for review.
- `Admin` users can manage users, regions, observations, and pending approvals.

## Project Goals

The project demonstrates how a normalized database-backed application can support real-world environmental monitoring workflows. It combines:

- data entry and CRUD operations,
- region and classification management,
- time-based forest observation tracking,
- subscription and notification-style workflows,
- review/approval pipelines for user-submitted updates,
- dashboard summaries and visual analytics.

## Main Features

- Search and explore forest regions on an interactive map.
- View historical trends and forest observations by region and time period.
- Save regions and follow updates relevant to a user’s interests.
- Submit research updates that can be reviewed by administrators.
- Review pending proposals and approve, reject, or track their status.
- Manage users, regions, land cover types, and classifications from admin tools.
- Display role-specific dashboard summaries using aggregated statistics.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, React Router, Axios, Leaflet, Recharts, Formik
- **Backend:** FastAPI, SQLAlchemy async, Pydantic, Uvicorn
- **Database:** Relational SQL schema defined in `db/sql/`
- **Authentication / Security:** Password hashing and token-related utilities in the backend

## Repository Structure

- `backend/` - FastAPI application, data models, routers, schemas, and database access
- `frontend/` - React client application, pages, components, utilities, and services
- `db/sql/` - SQL scripts for creating the database tables
- `db/diagrams/` - Database design diagram and DBML file
- `start.sh` - Convenience script to launch backend and frontend on macOS/Linux
- `start_project.bat` - Convenience script to launch backend and frontend on Windows

## Backend Overview

The backend exposes a REST API through FastAPI and organizes functionality into routers for:

- users
- regions
- subscriptions
- pending updates
- time periods
- metrics
- forest observations
- region classifications
- land cover types
- stats

It also includes:

- a root health/info endpoint,
- a `/health` endpoint that checks database connectivity,
- async SQLAlchemy session handling,
- CORS configuration for local frontend development.

The backend reads configuration from environment variables using `.env`, with `DATABASE_URL` required for database access.

## Frontend Overview

The frontend is a Vite-powered React app with route-based navigation for each role and major workflow. It includes:

- a login page,
- profile/settings page,
- guest, viewer, researcher, and admin dashboards,
- pages for searching regions and viewing maps,
- saved region and historical trend views,
- researcher proposal forms and proposal tracking,
- admin approval and management screens,
- reusable UI components such as headers, stats banners, and form inputs.

The frontend talks to the backend through the service layer in `frontend/src/services.ts`, which wraps API calls for login, CRUD operations, subscriptions, classifications, and dashboard statistics.

## Database Overview

The database schema is centered on core monitoring entities such as:

- users
- regions
- metrics
- subscriptions
- time periods
- forest observations
- land cover types
- region classifications
- pending updates

This structure supports both direct data management and derived analytics, while also preserving relationships between users, regions, observations, and classifications.

## Running Locally

### Prerequisites

- Python 3
- Node.js and npm
- A database reachable through `DATABASE_URL`

### Backend Setup

From the project root:

```bash
python -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
```

Create a `.env` file for the backend and set at least:

```env
DATABASE_URL=your_database_connection_string
```

Run the backend:

```bash
python -m backend.app.main
```

The API will be available at `http://localhost:8000`.

### Frontend Setup

From the `frontend/` directory:

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Convenience Scripts

- macOS/Linux: `bash ./start.sh`
- Windows: `start_project.bat`

These scripts attempt to create/install dependencies if needed and then start both services.

## Useful Endpoints

- `GET /` - basic API welcome message
- `GET /health` - database and API health check
- `GET /api/hello` - simple backend test route
- `GET /docs` - FastAPI interactive API documentation

## Notes

- The frontend is currently configured to call the backend at `http://localhost:8000`.
- Some pages in the frontend are labeled `StaticAdd...` or `StaticDelete...`, which reflect direct record-management workflows used by the project.
- The codebase includes a database diagram in `db/diagrams/` if you want to understand the schema visually.

## Authors

- Gavin Barro
- James Agresto
- Peter Gillen

## License

This project is distributed under the terms of the [LICENSE](LICENSE) file.
