# skillSprint

A full-stack skill development and learning platform.

## Project structure

- client: React + Vite frontend
- server: Express + MongoDB backend

## Local setup

### Frontend

```bash
cd client
npm install
npm run build
npm run dev
```

### Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

## Deployment notes

- Frontend is ready to deploy as a static build from the client/dist folder.
- Backend is ready to deploy with a Node.js runtime and MongoDB connection variables configured.
