# Life Notes API

> Backend API for Life Notes - Notes & Todos with 7 Types

## 🚀 Live URLs

| Environment | URL |
|-------------|-----|
| Production (Future) | `https://api.balaji-dev.in/notes` |
| Local Development | `http://localhost:3002` |

## 🏗️ Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 15 (Week 2)
- **Cache**: Redis 7 (Week 3)
- **Container**: Docker

## 📁 Project Structure

```
life-notes-api/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app setup
│   ├── config/
│   │   └── index.ts          # Configuration
│   ├── middleware/
│   │   ├── errorHandler.ts   # Global error handler
│   │   └── notFoundHandler.ts
│   ├── routes/
│   │   ├── health.routes.ts  # Health check endpoints
│   │   ├── notes.routes.ts   # Notes CRUD endpoints
│   │   └── todos.routes.ts   # Todos CRUD endpoints (7 types)
│   ├── controllers/          # (Week 2)
│   ├── services/             # (Week 2)
│   └── models/               # (Week 2)
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── .env.example
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/BalajiJ234/life-notes-api.git
cd life-notes-api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📡 API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health status |
| GET | `/api/health/ready` | Readiness check (K8s) |
| GET | `/api/health/live` | Liveness check (K8s) |

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes |
| GET | `/api/notes/:id` | Get single note |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

**Query Parameters:**
- `tag` - Filter by tag
- `pinned` - Filter by pinned status (true/false)
- `search` - Search in title and content

### Todos (7 Types)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Get all todos |
| GET | `/api/todos/types` | Get available todo types |
| GET | `/api/todos/:id` | Get single todo |
| POST | `/api/todos` | Create todo |
| PUT | `/api/todos/:id` | Update todo |
| PATCH | `/api/todos/:id/complete` | Toggle completion |
| DELETE | `/api/todos/:id` | Delete todo |

**Query Parameters:**
- `type` - Filter by type (task, goal, habit, reminder, shopping, idea, bookmark)
- `priority` - Filter by priority (low, medium, high, urgent)
- `completed` - Filter by completion status (true/false)
- `tag` - Filter by tag
- `search` - Search in title and description
- `dueBefore` - Filter by due date (before)
- `dueAfter` - Filter by due date (after)

## 📝 Todo Types

| Type | Icon | Description |
|------|------|-------------|
| `task` | ✅ | General tasks to complete |
| `goal` | 🎯 | Long-term goals to achieve |
| `habit` | 🔄 | Daily/weekly habits to track |
| `reminder` | ⏰ | Time-based reminders |
| `shopping` | 🛒 | Shopping list items |
| `idea` | 💡 | Ideas to explore later |
| `bookmark` | 🔖 | Links and resources to save |

## 📋 Example Requests

```bash
# Create a note
curl -X POST http://localhost:3002/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Meeting Notes", "content": "Discussed project timeline", "tags": ["work"]}'

# Create a task todo
curl -X POST http://localhost:3002/api/todos \
  -H "Content-Type: application/json" \
  -d '{"type": "task", "title": "Review PR", "priority": "high", "dueDate": "2025-12-02"}'

# Create a habit todo
curl -X POST http://localhost:3002/api/todos \
  -H "Content-Type: application/json" \
  -d '{"type": "habit", "title": "Morning exercise", "habitFrequency": "daily"}'

# Create a shopping todo
curl -X POST http://localhost:3002/api/todos \
  -H "Content-Type: application/json" \
  -d '{"type": "shopping", "title": "Milk", "quantity": 2}'

# Create a bookmark todo
curl -X POST http://localhost:3002/api/todos \
  -H "Content-Type: application/json" \
  -d '{"type": "bookmark", "title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/"}'

# Get all todos
curl http://localhost:3002/api/todos

# Get only habits
curl "http://localhost:3002/api/todos?type=habit"

# Toggle completion
curl -X PATCH http://localhost:3002/api/todos/{id}/complete
```

## 🔗 Related Projects

| Project | Repository | Description |
|---------|------------|-------------|
| Life Notes Frontend | [life-notes](https://github.com/BalajiJ234/life-notes) | React/Next.js frontend |
| Wealth Pulse API | [wealth-pulse-api](https://github.com/BalajiJ234/wealth-pulse-api) | Finance API |
| Personal Assistant | [personal-assistant](https://github.com/BalajiJ234/personal-assistant) | AI orchestrator |
| Life-Sync Gateway | [life-sync-2.0](https://github.com/BalajiJ234/life-sync-2.0) | Docs & gateway |

## 📜 License

MIT © Balaji J
