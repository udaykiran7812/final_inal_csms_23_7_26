# CSMS — Campus Service Management System

CSMS is a full-stack ticketing and helpdesk platform for managing service requests, complaints, and issues across departments (e.g. a campus, office, or facility). It provides role-based dashboards for end users, staff, department admins, and super admins, with SLA tracking, escalations, notifications, and audit logging built in.

🔗 **Live demo (frontend):** [final-inal-csms-23-7-26.vercel.app](https://final-inal-csms-23-7-26.vercel.app/)
> Note: the frontend needs a running backend + database to work. If the demo shows errors, the backend API may not be deployed/reachable — see [Deployment Notes](#deployment-notes).

## Tech Stack

**Backend**
- Java 21, Spring Boot 3.4.1
- Spring Web, Spring Data JPA, Spring Security
- MySQL (via `mysql-connector-j`)
- Flyway for database migrations
- JWT (`jjwt`) for authentication
- springdoc-openapi for API documentation (Swagger UI)
- Lombok, Spring Boot Actuator, Spring Boot DevTools
- Maven build (`mvnw` wrapper included)

**Frontend**
- React 19 + TypeScript
- Vite (build tool), Oxlint (linting)
- Tailwind CSS
- React Router DOM
- TanStack React Query (data fetching/caching)
- Axios (HTTP client)
- Recharts (analytics/dashboard charts)
- Three.js / @react-three/fiber / @react-three/drei (3D visuals)
- Framer Motion, GSAP, Lenis (animation & smooth scroll)

**Deployment**
- Dockerfile for the backend (multi-stage Maven build → JRE runtime image)
- `vercel.json` for frontend deployment on Vercel

## Project Structure

```
.
├── Dockerfile                  # Root Dockerfile for backend container
├── backend/
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   ├── Dockerfile
│   └── src/main/java/com/csms/
│       ├── auth/                # Login & authentication
│       ├── security/            # JWT filters & security config
│       ├── user/                # User accounts
│       ├── staff/                # Staff members
│       ├── role/                 # Roles & permissions
│       ├── department/           # Departments
│       ├── subdepartment/        # Sub-departments
│       ├── issuecategory/        # Ticket issue categories
│       ├── ticket/               # Core ticket entity/workflow
│       ├── history/              # Ticket history/audit trail
│       ├── comment/               # Ticket comments
│       ├── attachment/            # File attachments on tickets
│       ├── priority/              # Ticket priority levels
│       ├── sla/                   # SLA rules & change requests
│       ├── escalation/            # Ticket escalation rules
│       ├── calendar/              # Calendar/scheduling
│       ├── notification/          # User notifications
│       ├── feedback/              # Ticket/service feedback
│       ├── report/                # Reporting/analytics endpoints
│       ├── asset/                 # Asset management
│       ├── audit/                 # System audit logs
│       └── common/                # Shared entities, enums, exceptions, response wrappers
│       └── resources/db/migration # Flyway SQL migrations (V1 → V16)
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── auth/           # Login
    │   │   ├── user/           # End-user dashboard, create/view tickets
    │   │   ├── staff/          # Staff dashboard, assigned tickets
    │   │   ├── admin/          # Admin dashboard, users, staff, departments, roles, assets
    │   │   └── superadmin/     # SLA, escalation, priority, calendar, audit log, role management
    │   ├── components/
    │   ├── layouts/
    │   ├── routes/
    │   ├── services/ & api/    # Axios API clients
    │   ├── context/            # Auth/global context
    │   └── types/
    └── vercel.json
```

## Key Features

- **Ticket lifecycle management**: create, assign, comment on, attach files to, and track tickets end-to-end.
- **Role-based access**: distinct experiences for regular users, staff, admins, and super admins.
- **Departments & sub-departments**: organize staff and tickets by department hierarchy, with issue categories per department.
- **SLA management**: configurable SLA rules with deadline recalculation and change-request workflow.
- **Escalation management**: automatic/manual escalation of overdue or high-priority tickets.
- **Notifications**: in-app notifications for ticket updates.
- **Audit logging**: tracks system and ticket history for accountability.
- **Feedback**: post-resolution feedback collection.
- **Reporting & analytics**: dashboard charts (Recharts) for ticket/staff/SLA insights.
- **Asset management**: track organizational assets tied to tickets/departments.
- **JWT-based authentication** with Spring Security.

## Prerequisites

- Java 21 (JDK)
- Maven (or use the included `mvnw` wrapper)
- Node.js 18+ and npm
- MySQL 8+

## Getting Started

### 1. Backend Setup

Create a MySQL database (the app can auto-create it if it doesn't exist):

```bash
cd backend
```

Configure environment variables (or rely on the defaults in `application.properties`):

| Variable | Default | Description |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/csms_db?...` | MySQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | `root` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | *(set in properties file)* | DB password |
| `JWT_SECRET` | *(default dev secret)* | Secret used to sign JWTs |
| `PORT` | `8080` | Server port |

Run database migrations and start the server:

```bash
./mvnw spring-boot:run
```

Flyway will automatically apply migrations from `src/main/resources/db/migration` on startup.

The API will be available at `http://localhost:8080`, with Swagger UI typically at `http://localhost:8080/swagger-ui.html` (via springdoc-openapi).

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Set the backend API URL in `.env`:

```
VITE_API_BASE_URL=http://localhost:8080
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview a production build locally:

```bash
npm run preview
```

Lint the frontend:

```bash
npm run lint
```

### 3. Running with Docker (Backend)

A multi-stage Dockerfile is provided at the repo root:

```bash
docker build -t csms-backend .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://<host>:3306/csms_db" \
  -e SPRING_DATASOURCE_USERNAME="<user>" \
  -e SPRING_DATASOURCE_PASSWORD="<password>" \
  -e JWT_SECRET="<your-secret>" \
  csms-backend
```

## ⚠️ Security Note

`application.properties` currently ships with fallback default values for `spring.datasource.password` and `jwt.secret` baked into the source (used only if the corresponding env var isn't set). Since this repo is public:

- Treat those defaults as **compromised** — rotate the real MySQL password and JWT secret now if they were ever used outside local dev.
- Always set `SPRING_DATASOURCE_PASSWORD` and `JWT_SECRET` via environment variables in any deployed environment; never rely on the in-file defaults for anything but local, throwaway development.
- Consider replacing the hardcoded defaults in `application.properties` with harmless placeholders (e.g. `changeme`) so nothing sensitive sits in git history going forward.

## Database Migrations

Flyway migrations live in `backend/src/main/resources/db/migration` and are applied in order (`V1` through `V16`), covering the initial schema, issue categories, staff, tickets, ticket history, seed data, sub-department hierarchy, and SLA/enterprise refinements.

## Deployment Notes

- **Frontend**: configured for Vercel via `vercel.json` (SPA rewrite rule so all routes resolve to `index.html`).
- **Backend**: containerized via the root `Dockerfile`; suitable for platforms like Render, Railway, Fly.io, or any Docker-compatible host. Note the Hikari connection pool is tuned for constrained environments (e.g. Clever Cloud's 5-connection limit).

## License

No license file is currently included in this repository. Add one (e.g. MIT, Apache 2.0) if you intend to open-source this project.
