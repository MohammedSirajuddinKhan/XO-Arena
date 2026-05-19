# XOArena

XOArena is a real-time multiplayer tic-tac-toe arena built with Express, EJS, MongoDB, Passport authentication, and Socket.IO.

## Features

- User registration and login
- Guest play
- Real-time rooms with Socket.IO
- Live moves, chat, turn timers, rematches, and spectators
- Match history, leaderboard, and player stats
- Admin dashboard for room and user management

## Tech Stack

- Node.js
- Express
- EJS
- MongoDB and Mongoose
- Passport local authentication
- Socket.IO
- Cloudinary upload support

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update `.env` with your MongoDB URI and session secret:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb+srv://user:password@cluster.example.mongodb.net/xo-arena
SESSION_SECRET=replace-with-a-long-random-secret
TURN_SECONDS=30
CLIENT_ORIGIN=http://localhost:3000
```

Run the app:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

If Chrome or another browser tries to force HTTPS, use the explicit IPv4 URL:

```txt
http://127.0.0.1:3000
```

Do not open `https://localhost:3000`; the local development server is HTTP-only.

## Scripts

```bash
npm start
```

Starts the production server with `node server.js`.

```bash
npm run dev
```

Starts the server with `nodemon`.

```bash
npm run lint
```

Runs the syntax check script.

## Admin Access

Admin access is controlled by the `isAdmin` field on the `User` model.

The current development admin login is:

```txt
username: admin@xo
password: admin@xo
```

After login, admin users are redirected to:

```txt
/admin
```

Before deploying publicly, replace this weak admin password and avoid keeping hardcoded credentials in production.

## Deployment

This app uses Socket.IO, so it needs a host that supports long-running Node servers and WebSocket connections.

Recommended platforms:

- Render
- Railway
- Fly.io
- VPS hosting

Recommended Render settings:

```txt
Build command: npm install
Start command: npm start
```

Set these environment variables in your hosting dashboard:

```txt
NODE_ENV=production
MONGO_URI=your-production-mongodb-uri
SESSION_SECRET=your-long-random-secret
TURN_SECONDS=30
CLIENT_ORIGIN=https://your-production-domain
```

Vercel is not recommended for the full game because Vercel serverless functions do not run a persistent Socket.IO server.

## Project Structure

```txt
config/        Database, Passport, and Socket.IO setup
controllers/   Route handlers
middlewares/   Auth, admin, upload, and error middleware
models/        Mongoose models
public/        Static CSS, JavaScript, and images
routes/        Express routes
services/      Game and ranking logic
utils/         Shared helpers
views/         EJS templates
app.js         Express app setup
server.js      HTTP and Socket.IO server entry
```
