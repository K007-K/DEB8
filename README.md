# DEB8 - Debate Platform

A modern debate platform built with React, Vite, Express, and MongoDB.

## Features

- Real-time debate functionality
- User authentication and authorization
- Interactive UI with Material-UI and Tailwind CSS
- WebSocket support for live updates

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Material-UI** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DEB8-main
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` and configure your environment variables.

4. Start MongoDB:
```bash
# Make sure MongoDB is running on your system
mongod
```

## Development

Run the development server:

```bash
# Start frontend (Vite dev server)
npm run dev

# Start backend server (in a separate terminal)
npm run server
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
DEB8-main/
├── public/          # Static assets
├── server/          # Backend Express server
├── src/             # Frontend React application
│   ├── api/         # API configuration
│   ├── components/  # React components
│   ├── pages/       # Page components
│   └── ...
├── .env.example     # Environment variables template
├── .gitignore       # Git ignore rules
├── index.html       # HTML entry point
├── package.json     # Dependencies and scripts
├── tailwind.config.js
├── vite.config.js   # Vite configuration
└── README.md        # This file
```

## Environment Variables

See `.env.example` for required environment variables:

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `CLIENT_URL` - Frontend URL for CORS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.
