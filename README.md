# HEIST


## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- React Router for navigation
- React-Quill for rich text editing
- DOMPurify for XSS protection
- Skeleton CSS framework
- Axios for API requests
- crypto-js for MD5 password hashing

### Backend
- Node.js with Express
- PostgreSQL database
- Knex.js query builder/migrations
- JWT authentication
- bcrypt password hashing
- Multer for file uploads
- Socket.io for real-time features

### Infrastructure
- Docker Compose for orchestration

## Project Structure

```
checkpoint/
├── docker-compose.yml          # Docker orchestration
├── images/
│   ├── api/                    # Backend API service
│   │   ├── src/
│   │   │   ├── server.js       # Express app entry
│   │   │   ├── routes/         # API endpoints
│   │   │   │   ├── users.js    # Auth & user management
│   │   │   │   ├── classrooms.js
│   │   │   │   ├── feedback.js
│   │   │   │   └── checkpoints.js
│   │   │   ├── db/
│   │   │   │   ├── db.js       # Database connection
│   │   │   │   └── migrations/ # Schema migrations
│   │   │   └── helpers/        # Utility functions
│   │   └── uploads/            # Uploaded images
│   └── frontend/          # React frontend
│       ├── src/
│       │   ├── pages/          # Page components
│       │   ├── contexts/       # React contexts (Auth)
│       │   ├── services/       # API client
│       │   └── types/          # TypeScript interfaces
│       └── vite.config.ts      # Vite configuration
└── docs/
    └── style/                  # CSS styling reference
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (or use Docker)

### Environment Setup

1. Copy the environment template:
```bash
cp .env.template .env
```

2. Configure the following variables in `.env`:
```
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=checkpoint
TOKEN_ENCRYPTION=your_jwt_secret
```

### Running with Docker

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database
- API server on port 3000
- Frontend dev server on port 5173

### Database Migrations

Run migrations to set up the database schema:

```bash
docker-compose exec api npx knex migrate:latest
```

### Local Development

**Backend:**
```bash
cd images/api
npm install
npm run dev
```

**Frontend:**
```bash
cd images/vite_frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users/validate_token` - Validate JWT token

## Security Features

- Passwords hashed with MD5 on frontend before transmission
- Server-side password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (teacher/student)
- Input sanitization with DOMPurify
- File upload restrictions (image types only, 10MB limit)
- CORS configuration

## Author

Jan Everaert (jan@tastbaar.studio)

## License

MIT
