<div align="center">

# 🎯 DEB8

### The Ultimate Real-Time Debate & Polling Platform

**Transform discussions into structured debates with live participation, team collaboration, and instant polling**

[![Live Demo](https://img.shields.io/badge/demo-live-success.svg)](https://mydeb8.netlify.app)
[![GitHub Stars](https://img.shields.io/github/stars/K007-K/DEB8?style=social)](https://github.com/K007-K/DEB8)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Features](#-key-features) • [Demo](#-live-demo) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation)

</div>

---

## 📖 About DEB8

DEB8 is a cutting-edge platform that revolutionizes online debates and discussions. Whether you're hosting a structured 2v2 debate, organizing a free-for-all discussion, or conducting live polls, DEB8 provides the tools to make every voice heard in real-time.

Perfect for **educators**, **debate clubs**, **community organizers**, and anyone who wants to facilitate meaningful conversations online.

---

## ✨ Key Features

### 🎭 **Multiple Debate Formats**
- **2v2 Team Debates** - Structured debates with two teams arguing opposing viewpoints
- **Free-for-All Rooms** - Open discussions where everyone can participate
- **Role-Based Participation** - Join as debater or audience member
- **Private Rooms** - Password-protected debates for exclusive discussions

### 📊 **Live Polling System**
- Create custom polls with multiple options
- Real-time vote tracking and results visualization
- Category-based poll organization
- Time-limited polls with countdown timers
- User vote history and participation tracking

### 💬 **Real-Time Communication**
- Instant message delivery with WebSocket technology
- Team-specific chat channels in 2v2 debates
- Message history preservation
- Typing indicators and online status

### 👤 **User Management**
- Secure JWT-based authentication
- User profiles with activity statistics
- Personal debate and poll history
- Password recovery and account management

### 🎨 **Beautiful UI/UX**
- Modern, responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Material-UI components for consistency
- Dark mode support (coming soon)

---

## 🚀 Live Demo

Experience DEB8 in action: **[https://mydeb8.netlify.app](https://mydeb8.netlify.app)**

### Try It Out:
1. Create a free account in seconds
2. Browse trending debates and active polls
3. Join a public debate or create your own
4. Cast your vote in live polls
5. Track your participation in your profile

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Material-UI](https://img.shields.io/badge/MUI-7.0-007FFF?style=for-the-badge&logo=mui)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-8.2-47A248?style=for-the-badge&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=for-the-badge&logo=socket.io)

</div>

### Complete Technology List

**Frontend:**
- ⚛️ **React 18** - Component-based UI framework
- ⚡ **Vite** - Lightning-fast build tool and dev server
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **Material-UI** - Pre-built React components
- 🎬 **Framer Motion** - Animation library for smooth transitions
- 🗺️ **React Router** - Client-side routing
- 🔌 **Socket.io Client** - Real-time WebSocket communication
- 🌐 **Axios** - HTTP client for API requests

**Backend:**
- 🚂 **Express.js** - Fast, unopinionated web framework
- 🗄️ **MongoDB** - NoSQL database for flexible data storage
- 📦 **Mongoose** - Elegant MongoDB object modeling
- 🔌 **Socket.io** - Real-time bidirectional event-based communication
- 🔐 **JWT** - Secure authentication tokens
- 🔒 **bcrypt.js** - Password hashing for security
- 🌍 **CORS** - Cross-origin resource sharing
- 📝 **dotenv** - Environment variable management

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- 📦 **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- 🗄️ **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- 📝 **npm** or **yarn** - Comes with Node.js

### Installation

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/K007-K/DEB8.git
cd DEB8
```

#### 2️⃣ Install Dependencies
```bash
npm install
```

#### 3️⃣ Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/deb8

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

#### 4️⃣ Start MongoDB
```bash
# macOS/Linux
mongod

# Windows
mongod.exe
```

#### 5️⃣ Run the Application

**Option A: Development Mode (Recommended)**
```bash
# Terminal 1: Start the backend server
npm run server

# Terminal 2: Start the frontend dev server
npm run dev
```

**Option B: Using Concurrently (Coming Soon)**
```bash
npm run dev:all
```

#### 6️⃣ Access the Application
- 🎨 **Frontend**: [http://localhost:5173](http://localhost:5173)
- 🔧 **Backend API**: [http://localhost:5000](http://localhost:5000)
- 📊 **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   React UI  │  │  WebSocket  │  │   Axios     │        │
│  │  Components │  │   Client    │  │ HTTP Client │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Express.js │  │  Socket.io  │  │   JWT Auth  │        │
│  │   Routes    │  │   Server    │  │ Middleware  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Users    │  │    Rooms    │  │    Polls    │        │
│  │  Collection │  │ Collection  │  │ Collection  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                      MongoDB Atlas                          │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

1. **📱 Frontend Layer**
   - React-based SPA with modern UI/UX
   - Real-time updates via Socket.io
   - RESTful API integration with Axios
   - Client-side routing with React Router

2. **⚙️ Backend Layer**
   - Express.js API server
   - JWT-based authentication
   - WebSocket server for real-time features
   - CORS configuration for secure cross-origin requests

3. **🗄️ Database Layer**
   - MongoDB for flexible data storage
   - Mongoose ODM for data modeling
   - Indexed collections for optimal performance
   - Automatic timestamps and validation

---

## 📁 Project Structure

```
DEB8/
├── 📂 public/                 # Static assets
│   ├── index.html
│   └── _redirects.txt
├── 📂 server/                 # Backend application
│   ├── index.js              # Main server file
│   └── 📂 models/            # Database models
│       └── Room.js           # Room schema
├── 📂 src/                    # Frontend application
│   ├── 📂 api/               # API configuration
│   │   ├── axios.js          # Axios instance with auth
│   │   └── axiosNoAuth.js    # Axios without auth
│   ├── 📂 components/        # Reusable components
│   │   ├── Header.jsx
│   │   ├── PollCard.jsx
│   │   └── ...
│   ├── 📂 context/           # React context providers
│   │   └── AuthContext.jsx
│   ├── 📂 pages/             # Page components
│   │   ├── LandingPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── RoomPage.jsx
│   │   └── ...
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # App entry point
│   └── index.css             # Global styles
├── 📄 .env.example           # Environment variables template
├── 📄 .gitignore             # Git ignore rules
├── 📄 .gitattributes         # Git attributes
├── 📄 CONTRIBUTING.md        # Contribution guidelines
├── 📄 package.json           # Dependencies and scripts
├── 📄 tailwind.config.js     # Tailwind configuration
├── 📄 vite.config.js         # Vite configuration
└── 📄 README.md              # This file
```

---

## 🎮 Usage Guide

### Creating a Debate Room

1. **Navigate to Create Room** from the home page
2. **Choose Format**: 2v2 Team Debate or Free-for-All
3. **Fill Details**:
   - Topic and description
   - Category selection
   - Max participants (for free-for-all)
   - Team names and descriptions (for 2v2)
4. **Privacy Options**: Make it public or private with password
5. **Launch** and share the room ID with participants

### Creating a Poll

1. **Go to Create Poll** section
2. **Enter Question** that you want to ask
3. **Add Options** (minimum 2, maximum unlimited)
4. **Select Category** for organization
5. **Set End Date** for the poll
6. **Publish** and share with your audience

### Joining Debates

- **Public Rooms**: Browse and join directly
- **Private Rooms**: Enter room ID and password
- **Choose Role**: Debater or Audience
- **For 2v2**: Select your team

---

## 🔧 Development

### Available Scripts

```bash
# Start frontend development server
npm run dev

# Start backend server
npm run server

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Environment Setup for Development

1. **Frontend Development**: Runs on `http://localhost:5173`
2. **Backend Development**: Runs on `http://localhost:5000`
3. **MongoDB**: Local instance on `mongodb://localhost:27017/deb8`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

#### Rooms
- `GET /api/rooms` - Get user's rooms
- `GET /api/rooms/debates` - Get all debate rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:roomId` - Get room details
- `POST /api/rooms/:roomId/join` - Join a room
- `DELETE /api/rooms/:roomId` - Delete room

#### Polls
- `GET /api/polls` - Get all polls
- `GET /api/polls/trending` - Get trending polls
- `POST /api/polls` - Create new poll
- `POST /api/polls/:pollId/vote` - Vote on a poll
- `GET /api/polls/my-polls` - Get user's polls

#### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/room-history` - Get user's room history

---

## 🚀 Deployment

### Frontend (Netlify)

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Backend (Render/Railway/Heroku)

1. Set environment variables on your hosting platform
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm run server`

### Database (MongoDB Atlas)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in your environment variables

---

## 🤝 Contributing

We love contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ by the DEB8 team
- Inspired by the need for better online debate platforms
- Special thanks to all our contributors

---

## 📞 Contact & Support

- 📧 Email: support@deb8platform.com
- 🐛 Issues: [GitHub Issues](https://github.com/K007-K/DEB8/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/K007-K/DEB8/discussions)
- 🌐 Website: [https://mydeb8.netlify.app](https://mydeb8.netlify.app)

---

<div align="center">

**⭐ Star us on GitHub — it motivates us a lot!**

Made with 💜 by DEB8 Team

[⬆ Back to Top](#-deb8)

</div>
