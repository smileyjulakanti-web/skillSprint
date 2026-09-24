# SkillSprint ⚡

A modern, production-ready full-stack developer skill tracking and sprint platform.

## Architecture

- **Frontend (`client/`)**: React 19, Vite, React Router 7, modern dark-mode aesthetic with glassmorphic cards and interactive sprint checklists.
- **Backend (`server/`)**: Node.js, Express, MongoDB (Mongoose), bcrypt password hashing, JWT authentication, and `/api/health` monitoring.

---

## Production Deployment Guide

### 1. Frontend on Vercel
This repository is pre-configured with `vercel.json` and `client/vercel.json` to handle automated builds and SPA rewrites out of the box:
- **Root Directory**: Can remain as `./` (default) or set to `client`
- **Build Command**: `cd client && npm install && npm run build` (or `vite build` if root is `client`)
- **Output Directory**: `client/dist` (or `dist` if root is `client`)
- **Environment Variable**:
  - `VITE_API_URL`: Set to your deployed backend URL on Render (e.g. `https://skillsprint.onrender.com`)

### 2. Backend on Render
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `MONGO_URI`: Your MongoDB Atlas connection string
  - `JWT_SECRET`: A secure random secret key
  - `PORT`: Automatically assigned by Render (defaults to `5000` locally)
- **Health Check Path**: `/api/health`

---

## Local Development

### 1. Root Monorepo Commands
```bash
# Build client
npm run build

# Start frontend dev server
npm run client:dev

# Start backend dev server
npm run server:dev
```

### 2. Manual Setup
```bash
# Frontend
cd client
npm install
npm run dev

# Backend
cd server
npm install
cp .env.example .env
npm run dev
```
