# DEB8 — Complete Interview-Ready Project Explanation (Part 1)

---

## 1. Project Overview

### What It Does
DEB8 is a real-time debate and polling platform where users can create structured debate rooms (2v2 team debates or free-for-all), launch live polls with time-limited voting, and participate in discussions — all with instant message delivery via WebSockets.

### Problem It Solves
Online discussions today happen on Twitter/Reddit — unstructured, chaotic, no moderation. DEB8 solves this by providing **structured debate formats** with team assignments, role-based participation (debater vs. audience), private rooms with password protection, and real-time polling with live vote tracking. It turns messy arguments into organized, productive debates.

### Target Users
- **Educators** running classroom debates
- **Debate clubs** hosting structured 2v2 competitions
- **Community organizers** conducting opinion polls
- **Students** practicing argumentation skills
- **Anyone** who wants meaningful discussions, not Twitter flame wars

---

## 2. Why I Built It

### Motivation
I noticed that platforms like Discord and Reddit don't offer **structured debate formats**. You can chat, but you can't organize a proper 2v2 debate with team assignments, audience roles, and turn management. I wanted to build something purpose-built for debates — not a general chat app retrofitted for discussions.

### Real-World Relevance
- Online debate is growing — Model UN, competitive debate leagues are moving online
- Live polling is used in classrooms, town halls, corporate meetings
- Real-time communication is now table stakes — users expect instant updates
- The project demonstrates full-stack engineering: REST APIs + WebSockets + Auth + Database design

---

## 3. Tech Stack (With Reasoning)

### Frontend

| Tech | Why Chosen | Alternatives Considered |
|------|-----------|------------------------|
| **React 18** | Component-based architecture, massive ecosystem, hooks for state management | Vue.js (smaller community), Svelte (less mature ecosystem) |
| **Vite** | 10x faster HMR than CRA, native ES modules, instant cold starts | Create React App (slow, deprecated), Webpack (complex config) |
| **Tailwind CSS** | Utility-first = rapid prototyping, no CSS file bloat, responsive by default | Bootstrap (opinionated design), Styled Components (runtime overhead) |
| **Material-UI (MUI)** | Pre-built accessible components (buttons, cards, dialogs), consistent design system | Chakra UI (smaller ecosystem), Ant Design (heavier bundle) |
| **Framer Motion** | Declarative animations, mount/unmount animations, gesture support | CSS animations (limited), React Spring (steeper API) |
| **React Router v6** | Declarative routing, nested routes, protected route patterns | Next.js (SSR overhead unnecessary for this SPA) |
| **Socket.io Client** | Automatic reconnection, fallback to polling, room-based events | Raw WebSocket API (no reconnection, no rooms, no fallbacks) |
| **Axios** | Request/response interceptors for auth tokens, automatic JSON parsing | Fetch API (no interceptors, manual error handling) |

### Backend

| Tech | Why Chosen | Alternatives Considered |
|------|-----------|------------------------|
| **Node.js + Express** | Non-blocking I/O perfect for real-time apps, JS everywhere (shared types) | Django (sync by default), Spring Boot (JVM overhead for small project) |
| **Socket.io Server** | Built-in room management, namespace support, automatic reconnection | ws library (bare-bones, no rooms), Pusher (paid, vendor lock-in) |
| **JWT (jsonwebtoken)** | Stateless auth, no session storage needed, works across WebSocket + REST | Session cookies (need sticky sessions with WebSocket), OAuth only (complex) |
| **bcryptjs** | Industry-standard password hashing, adaptive cost factor | Argon2 (better but less Node.js support), SHA-256 (not designed for passwords) |

### Database

| Tech | Why Chosen | Alternatives Considered |
|------|-----------|------------------------|
| **MongoDB** | Flexible schema for varied room types (debate/poll), embedded documents for messages | PostgreSQL (rigid schema for evolving data), Firebase (vendor lock-in) |
| **Mongoose** | Schema validation, middleware hooks, population (joins), type casting | Native MongoDB driver (no validation, no schema), Prisma (SQL-focused) |

### Deployment

| Tech | Why Chosen | Alternatives Considered |
|------|-----------|------------------------|
| **Netlify** (Frontend) | Free tier, automatic deploys from Git, SPA redirects via `_redirects` | Vercel (similar), GitHub Pages (no SPA routing) |
| **Render** (Backend) | Free tier with WebSocket support, auto-deploy from Git, env vars UI | Heroku (deprecated free tier), Railway (limited free hours) |
| **MongoDB Atlas** (DB) | Free 512MB cluster, managed backups, global regions | Self-hosted MongoDB (ops overhead), Supabase (SQL not ideal here) |

---

## 4. Architecture Flow

### System Architecture (3-Tier)

```
┌─────────────────────────────────────────────────┐
│              CLIENT (React SPA)                  │
│  React Router → Pages → Components → Context     │
│  Axios (REST) ←→ Socket.io Client (WebSocket)    │
└──────────────┬──────────────┬────────────────────┘
               │ HTTPS/REST   │ WSS/WebSocket
               ↓              ↓
┌──────────────┴──────────────┴────────────────────┐
│           SERVER (Express + Socket.io)            │
│  REST Routes → Auth Middleware → Business Logic   │
│  Socket.io Events → Room Management → Broadcast   │
└──────────────────────┬───────────────────────────┘
                       │ Mongoose ODM
                       ↓
┌──────────────────────────────────────────────────┐
│              DATABASE (MongoDB Atlas)              │
│  Users │ Rooms │ Polls │ UserProfiles              │
└──────────────────────────────────────────────────┘
```

### Frontend → Backend Communication

**REST API (Axios)** — Used for CRUD operations:
1. User registers → `POST /api/auth/register` → Server hashes password with bcrypt → Stores in MongoDB → Returns JWT
2. User creates room → `POST /api/rooms` (JWT in Authorization header) → Server validates, creates Room document → Returns roomId
3. User browses debates → `GET /api/rooms/debates` → Server queries MongoDB with category filter → Returns formatted array

**WebSocket (Socket.io)** — Used for real-time features:
1. User joins room page → Socket connects with JWT in handshake auth
2. Client emits `joinRoom` → Server verifies room exists → Adds socket to Socket.io room
3. User sends message → Client emits `message` event → Server saves to MongoDB → Broadcasts to all sockets in that room via `io.to(roomId).emit('message', msg)`
4. User disconnects → Server removes from participants → Emits `userLeft` to remaining users

### Authentication Flow
```
Register/Login → Server validates → bcrypt.hash/compare
    → jwt.sign({id, username}, secret, {expiresIn: '7d'})
    → Token returned to client → Stored in localStorage
    → Every subsequent request: Axios interceptor adds "Bearer <token>"
    → Server middleware: jwt.verify() → Attaches req.user → Route proceeds
    → On 401: Axios response interceptor clears token → Redirects to /auth
```

### State Management
- **AuthContext (React Context)** — Global auth state (user object, login/logout/register functions)
- **Component-level useState** — Local UI state (form inputs, loading flags, modals)
- **Socket.io event handlers** — Real-time state updates (new messages, user joins/leaves)
- No Redux/Zustand needed — Context + local state is sufficient for this scale

### Database Flow
```
Client Request → Express Route → Mongoose Model.find/create/update
    → MongoDB Atlas (cloud) → Response formatted → JSON sent to client
```
- All queries use Mongoose's `.populate()` for joining referenced documents (e.g., room.createdBy → username)
- `.lean()` used on read queries for performance (returns plain JS objects, not Mongoose documents)
- `.sort('-createdAt')` for reverse chronological ordering
# DEB8 — Interview Guide (Part 2): Features, DB, API

---

## 5. Core Features (Deep Dive)

### Feature 1: Real-Time Debate Rooms (2v2 + Free-for-All)

**How it works internally:**
1. Creator selects debate format (2v2 or freeForAll) → Fills topic, description, category, team names
2. `POST /api/rooms` creates a Room document with `format: 'debate'`, `debateType: '2vs2'`, team1/team2 sub-documents
3. On room page load, Socket.io connects → Emits `joinRoom` event → Server adds socket to Socket.io room channel
4. Messages emitted via `socket.emit('message', {roomId, content, userId, username, team})` → Server persists to `room.messages[]` array → Broadcasts to all via `io.to(roomId).emit('message', msg)`
5. Messages stored as embedded documents inside the Room — no separate Messages collection

**Challenges faced:**
- **Race condition on participant join**: Two users joining simultaneously caused duplicate participants. **Solution**: Used MongoDB's `$pull` before `$push` — atomically remove existing entry then add new one.
- **Socket.io auth**: Needed JWT verification on WebSocket connections, not just REST. **Solution**: Used `io.use()` middleware to verify JWT from `socket.handshake.auth.token` before allowing connection.
- **Message ordering**: Embedded messages array needed proper timestamps. **Solution**: Server assigns `timestamp: new Date()` — never trust client timestamps.

### Feature 2: Live Polling System

**How it works internally:**
1. Creator submits poll question + options array + category + end date
2. Server generates unique `pollId` via `Math.random().toString(36).substring(2, 15)`
3. Options stored as `Map<index, optionText>`, votes as `Object<index, count>`, userVotes as `Object<userId, optionIndex>`
4. Voting endpoint (`POST /api/polls/:pollId/vote`) handles three scenarios:
   - **First vote**: Increment `votes[option]`, set `userVotes[userId] = option`, update UserProfile participation count
   - **Change vote**: Decrement old option, increment new option, update userVotes mapping
   - **Toggle off**: If same option clicked again, decrement and delete from userVotes
5. `poll.markModified('votes')` required because Mongoose doesn't auto-detect changes to Mixed/Object types

**Challenges faced:**
- **Mongoose Mixed type detection**: `votes` and `userVotes` are plain Objects in MongoDB. Mongoose doesn't track changes to nested Objects. Without `markModified()`, changes silently don't save. Spent 2 hours debugging "votes not updating" before discovering this.
- **Poll expiry**: Needed to prevent voting after `endDate`. **Solution**: Server-side check `if (new Date(poll.endDate) <= new Date())` before processing vote — never rely on frontend validation alone.

### Feature 3: Private Rooms with Password Protection

**How it works internally:**
1. Creator toggles `isPrivate: true` + sets password during room creation
2. Password stored as plain text in Room document (improvement: should be hashed)
3. When another user tries to join, frontend sends `POST /api/rooms/:roomId/join` with `{role: 'check', password: '...'}` first
4. If password matches, server returns success → Frontend then sends actual join request with `{role: 'debater', password: '...'}`
5. Two-step join: verification check → actual join. Prevents UI showing room data before password is confirmed

### Feature 4: User Profile & Activity Tracking

**How it works internally:**
1. On registration, both User document AND UserProfile document are created
2. UserProfile tracks: `pollsParticipated` (array of Poll ObjectIds), `pollsParticipatedCount` (denormalized count)
3. Profile page shows: username, join date, active polls created (queried with `endDate: { $gt: new Date() }`), polls participated count
4. When a poll is deleted, all affected UserProfile documents are batch-updated: `UserProfile.updateMany()` with `$pull` and `$inc: { pollsParticipatedCount: -1 }`

### Feature 5: Room Management (Terminate, Kick, Leave)

**How it works internally:**
- **Terminate**: Only creator can terminate → Sets `room.status = 'TERMINATED'` → Emits `roomTerminated` to all connected sockets → UI shows terminated state
- **Kick**: Creator sends `POST /api/rooms/:roomId/kick` with userId + reason → Server removes from participants, adds to `kickedUsers[]` array → Emits `userKicked` event with reason
- **Leave**: Any participant can leave → `POST /api/rooms/:roomId/leave` → Server filters out from participants → Emits `userLeft` event

---

## 6. Database Design

### Collections & Schemas

**Users Collection:**
```
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (bcrypt hashed, required),
  createdAt: Date
}
```

**Rooms Collection (main entity):**
```
{
  _id: ObjectId,
  roomId: String (unique, client-generated),
  topic: String (required),
  description: String,
  category: String (required),
  format: 'debate' | 'poll' (required),
  debateType: '2vs2' | 'freeForAll' (required if debate),
  status: 'LIVE' | 'ENDED' | 'SCHEDULED',
  createdBy: String (userId ref),
  isPrivate: Boolean,
  password: String (only if private),
  team1: { name, description, members[], maxDebaters },
  team2: { name, description, members[], maxDebaters },
  participants: [{
    userId, username, role: 'debater'|'audience',
    team: 'team1'|'team2'|null, joinedAt: Date
  }],
  messages: [{
    content (required), userId, username (required),
    type: 'debate'|'audience', team, timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date,
  endedAt: Date
}
```

**Polls Collection:**
```
{
  _id: ObjectId,
  pollId: String (unique, random),
  question: String (required),
  options: Map<String, String> (index→text),
  votes: Object (index→count),
  userVotes: Object (userId→optionIndex),
  category: String (required),
  createdBy: ObjectId (ref: User),
  endDate: Date (required),
  createdAt: Date
}
```

**UserProfiles Collection:**
```
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  username: String,
  pollsParticipated: [ObjectId] (ref: Poll),
  pollsParticipatedCount: Number,
  createdAt: Date
}
```

### Why MongoDB (NoSQL) Over PostgreSQL (SQL)?

| Reason | Explanation |
|--------|-------------|
| **Flexible schema** | Rooms have wildly different shapes: debate rooms need teams, polls need options/votes. MongoDB handles this with optional fields naturally. In PostgreSQL, I'd need separate tables or JSONB columns — losing type safety. |
| **Embedded documents** | Messages are embedded inside Rooms. In PostgreSQL, this would be a separate `messages` table requiring JOINs on every room load. With MongoDB, one `findOne()` gives me the room + all its messages. |
| **Evolving schema** | During development, I frequently added/removed fields (kickedUsers, pollOptions, watching). MongoDB doesn't require migrations — just add the field. PostgreSQL would need ALTER TABLE for every change. |
| **Document model matches API response** | The Room document shape is almost identical to the JSON API response. Minimal transformation needed. |

### Relationships
- **User → Rooms**: One-to-Many (createdBy field in Room)
- **User → Polls**: One-to-Many (createdBy field in Poll, with ObjectId ref)
- **User → UserProfile**: One-to-One (userId in UserProfile)
- **Room → Messages**: One-to-Many (embedded array — not a separate collection)
- **UserProfile → Polls**: Many-to-Many (pollsParticipated array of ObjectIds)

### Indexing
- `roomId`: Unique index — primary lookup key for rooms
- `pollId`: Unique index — primary lookup key for polls
- `username` + `email` on Users: Unique indexes — prevents duplicates, speeds up login queries
- `createdBy` on Rooms: Index for "my rooms" queries
- `participants.userId` on Rooms: For user history queries

---

## 7. API Design

### Key Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET | `/api/auth/verify` | Yes | Validate token on app load |
| GET | `/api/rooms/debates` | Yes | Browse all debate rooms |
| GET | `/api/rooms/polls` | Yes | Browse all poll rooms |
| GET | `/api/rooms/my-rooms` | Yes | User's created rooms |
| POST | `/api/rooms` | Yes | Create room |
| GET | `/api/rooms/:roomId` | Yes | Get room details |
| POST | `/api/rooms/:roomId/join` | Yes | Join room (with password for private) |
| POST | `/api/rooms/:roomId/terminate` | Yes | Creator terminates room |
| POST | `/api/rooms/:roomId/kick` | Yes | Creator kicks user |
| POST | `/api/rooms/:roomId/leave` | Yes | User leaves room |
| DELETE | `/api/rooms/:roomId` | Yes | Creator deletes room |
| POST | `/api/polls` | Yes | Create poll |
| GET | `/api/polls` | Yes | All polls |
| GET | `/api/polls/trending` | No | Top 8 by vote count |
| POST | `/api/polls/:pollId/vote` | Yes | Vote/change vote/unvote |
| DELETE | `/api/polls/:pollId` | Yes | Creator deletes poll |
| GET | `/api/users/profile` | Yes | Get profile + stats |
| PUT | `/api/users/profile` | Yes | Update username |
| GET | `/api/rooms/user-history` | Yes | All rooms user participated in |

### Request/Response Flow Example (Voting)

```
Client: POST /api/polls/abc123/vote
Headers: { Authorization: "Bearer eyJ..." }
Body: { option: "1", userId: "507f1f77bcf86cd7..." }

Server Flow:
1. authenticateToken middleware → Verify JWT → Attach req.user
2. Find poll by pollId
3. Check endDate > now (not expired)
4. Check userVotes[userId] — first vote? change? toggle?
5. Update votes counts + userVotes mapping
6. poll.markModified('votes') + poll.markModified('userVotes')
7. Save poll + update UserProfile (Promise.all for parallel writes)

Response 200: {
  success: true,
  poll: { pollId, question, options, votes, userVotes, endDate }
}

Error 400: { message: "Poll has ended" }
Error 404: { message: "Poll not found" }
Error 401: { message: "No token provided" }
```

### Validation Strategy
- **Required fields**: Checked manually in route handlers (`if (!topic || !description) return 400`)
- **Enum validation**: Mongoose schema-level (`enum: ['debate', 'poll']`) — rejects invalid values at save
- **Conditional required**: `debateType` required only when `format === 'debate'` (Mongoose conditional `required` function)
- **Team validation for 2v2**: Server checks `team1.name && team1.description && team2.name && team2.description` before creating

### Error Handling Pattern
```javascript
app.post('/api/rooms', authenticateToken, async (req, res) => {
  try {
    // Validation → Business logic → Response
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room', details: error.message });
  }
});

// Global error handler (catch-all)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Process-level handlers (prevent crashes)
process.on('uncaughtException', (err) => console.error('Uncaught:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled:', err));
```
# DEB8 — Interview Guide (Part 3): Security, Performance, Scale, Deployment

---

## 8. Authentication & Security

### JWT Auth Flow
```
1. Registration: password → bcrypt.hash(password, 10) → stored hashed
2. Login: bcrypt.compare(input, stored) → if valid → jwt.sign({id, username}, secret, {expiresIn:'7d'})
3. Token stored: localStorage.setItem('token', jwt)
4. Every request: Axios interceptor adds Authorization: Bearer <token>
5. Server: authenticateToken middleware extracts token from header → jwt.verify()
6. On 401: Axios response interceptor clears localStorage → redirects to /auth
```

### Password Handling
- **bcrypt with cost factor 10** — takes ~100ms to hash, makes brute-force infeasible
- Passwords never stored in plain text, never logged, never returned in API responses
- `User.findById(req.user.id).select('-password')` — explicitly excludes password from queries

### WebSocket Authentication
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  jwt.verify(token, secret, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = decoded;
    next();
  });
});
```
Every WebSocket connection is authenticated before events are processed.

### CORS Configuration
```javascript
cors({
  origin: "https://mydeb8.netlify.app",  // Whitelist only production frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
})
```
- Not using `origin: '*'` — that would allow any site to make requests
- Same CORS config applied to both Express middleware AND Socket.io server

### Authorization (Who Can Do What)
- **Room termination**: `room.createdBy.toString() !== req.user.id` → 403
- **Room deletion**: Same creator-only check
- **Kick users**: Creator-only check
- **Poll deletion**: `poll.createdBy.toString() !== req.user.id` → 403

### SQL/NoSQL Injection Prevention
- Using Mongoose ODM — all queries are parameterized by default
- `Room.findOne({ roomId: req.params.roomId })` — Mongoose escapes the parameter
- No raw string concatenation in queries

### XSS Prevention
- React auto-escapes all rendered content by default (`{variable}` is safe)
- No `dangerouslySetInnerHTML` used anywhere
- Input validation on server: message content is stored as-is but rendered safely by React

### Areas for Improvement (Be Honest in Interviews)
- Private room passwords stored in plain text — should use bcrypt
- No rate limiting implemented — vulnerable to brute force login attacks
- No CSRF protection (mitigated because JWT is in Authorization header, not cookies)
- JWT secret has fallback string in code — should fail if env var missing

---

## 9. Performance Optimization

### What's Implemented

| Technique | Where | Impact |
|-----------|-------|--------|
| **`.lean()` queries** | All GET endpoints | Returns plain JS objects instead of Mongoose documents — 3-5x faster, less memory |
| **`.select('-messages')` on listings** | `/api/rooms/polls` | Excludes large messages array when only showing room cards — reduces payload by 80%+ |
| **Embedded documents** | Messages inside Rooms | Eliminates JOIN operations — one query returns room + messages |
| **`Promise.all()` for parallel writes** | Vote endpoint | Saves poll + UserProfile simultaneously instead of sequentially |
| **Axios instance with interceptors** | Frontend API layer | Single configured instance reused everywhere — no repeated config |
| **Vite build optimization** | `optimizeDeps.exclude: ['lucide-react']` | Prevents pre-bundling of icon library — faster dev server startup |
| **Vite dev proxy** | `/api` and `/socket.io` proxied | Avoids CORS issues in development, simplifies local testing |

### Frontend Performance
- **Code splitting**: React Router lazy-loads page components (each page is a separate chunk)
- **Conditional rendering**: Components only render when data is available (loading states prevent empty renders)
- **Socket.io event cleanup**: `useEffect` cleanup functions remove event listeners on component unmount — prevents memory leaks

### What Could Be Added
- Server-side pagination (currently returning all rooms/polls)
- Redis caching for trending polls (computed on every request currently)
- Message pagination in rooms (currently loading ALL messages at once)
- Image optimization / lazy loading for any future media support
- `useMemo` / `useCallback` for expensive computations in components

---

## 10. Scalability Discussion

### Current Limitations (Honest Assessment)
- Single Node.js process → max ~10K concurrent WebSocket connections
- All messages embedded in Room document → MongoDB 16MB document limit
- No horizontal scaling → one server handles everything
- Trending polls computed on every request → O(n) for all polls

### How to Scale to Millions of Users

**1. WebSocket Scaling:**
- Use **Socket.io with Redis adapter** — enables multiple Node.js instances sharing the same Socket.io rooms
- Each server connects to Redis pub/sub — when server A emits to room, Redis propagates to server B
- Deploy behind **AWS ALB** with sticky sessions (WebSocket upgrade needs same server)

**2. Database Scaling:**
- **Extract messages to separate collection** — Room document stays small, messages paginated separately
- **MongoDB sharding** — shard by roomId for write distribution
- **Read replicas** — read queries go to secondaries, writes to primary
- **TTL indexes** — auto-delete old terminated rooms after 30 days

**3. Caching:**
- **Redis** for trending polls (compute once, cache 5 min)
- **Redis** for active room participant counts (avoid DB queries for room listings)
- **CDN** (CloudFront) for static frontend assets

**4. Message Queue:**
- **Bull/BullMQ + Redis** for background jobs: poll expiry notifications, room cleanup
- Decouple message persistence from broadcast — write to queue, worker persists to DB

**5. Microservices (at extreme scale):**
- Split into: Auth Service, Room Service, Poll Service, Chat Service, Notification Service
- Each service independently scalable
- gRPC for inter-service communication

---

## 11. Deployment

### Current Setup
- **Frontend**: Netlify (auto-deploy from GitHub, `_redirects` file for SPA routing)
- **Backend**: Render (free tier, auto-deploy, supports WebSocket)
- **Database**: MongoDB Atlas (free M0 cluster, 512MB)
- **Domain**: `mydeb8.netlify.app` (frontend), `deb8.onrender.com` (API)

### CI/CD
- Push to `main` → Netlify auto-builds frontend (`npm run build`)
- Push to `main` → Render auto-deploys backend
- No manual deployment steps

### Environment Variables
- Frontend: API base URL hardcoded in axios config (`https://deb8.onrender.com`)
- Backend: `MONGODB_URI`, `JWT_SECRET`, `PORT`, `CLIENT_URL` in Render dashboard
- `.env.example` committed with placeholder values for local setup

### Production Challenges Faced
1. **Render cold starts**: Free tier spins down after 15 min inactivity → First request takes 30-50 seconds. **Mitigation**: Health check endpoint + uptime monitoring ping.
2. **CORS across domains**: Frontend on Netlify, backend on Render → Different origins. **Solution**: Explicit CORS origin whitelist matching production frontend URL.
3. **WebSocket connection drops**: Render free tier has timeout limits. **Solution**: Socket.io automatic reconnection handles this transparently.
4. **SPA routing on Netlify**: Direct URL access to `/home` returned 404. **Solution**: `_redirects` file with `/* /index.html 200` rule.

---

## 12. Biggest Challenges Faced

### Challenge 1: Mongoose Mixed Type Not Saving
- **Problem**: Poll votes weren't updating in MongoDB. Code looked correct, no errors thrown, but `poll.save()` didn't persist vote changes.
- **Root Cause**: `votes` and `userVotes` are Schema.Types.Mixed (plain Objects). Mongoose uses change tracking — it doesn't deep-watch Object properties. Setting `poll.votes[option] = newValue` doesn't trigger Mongoose's change detection.
- **Solution**: Added `poll.markModified('votes')` and `poll.markModified('userVotes')` before `.save()` — explicitly tells Mongoose these fields changed.
- **Lesson**: Always use `markModified()` for Mixed/Object types in Mongoose, or better — use Map type with explicit schema.

### Challenge 2: Socket.io Auth + REST Auth Sync
- **Problem**: Users could connect to WebSocket without being authenticated — security hole where unauthorized users could listen to room messages.
- **Root Cause**: Socket.io connections bypass Express middleware. The `authenticateToken` middleware only runs on REST routes, not WebSocket handshakes.
- **Solution**: Added `io.use()` middleware that extracts JWT from `socket.handshake.auth.token` and verifies it before allowing the connection. Unauthorized sockets get disconnected immediately.

### Challenge 3: Duplicate Participants on Concurrent Joins
- **Problem**: Same user appeared twice in room participants list after quickly navigating away and back.
- **Root Cause**: The join endpoint used `$push` to add participants. If the user was already in the array, it pushed a duplicate.
- **Solution**: Added `$pull` (remove existing) before `$push` (add new) — makes the operation idempotent. Also added server-side check for existing participant.

### Challenge 4: CORS + Socket.io on Different Domains
- **Problem**: WebSocket connection failed in production with CORS errors, even though REST API worked fine.
- **Root Cause**: Express CORS middleware only applies to HTTP requests. Socket.io server needs its own CORS configuration.
- **Solution**: Added matching CORS config to both `cors()` middleware AND `new Server(httpServer, { cors: {...} })`.

---

## 13. What I Learned

### Technical Learnings
- **WebSocket architecture** is fundamentally different from REST — event-driven, persistent connections, room-based broadcasting
- **Mongoose quirks**: `markModified()`, `.lean()` for performance, population for cross-collection references
- **JWT lifecycle**: Token generation, storage, verification, expiry, and automatic logout on 401
- **CORS**: Must be configured at every layer that handles HTTP — Express middleware, Socket.io server, and Vite dev proxy
- **Embedded vs. Referenced documents**: Embedded (messages in Room) is fast for reads but creates document size issues at scale

### Engineering Learnings
- **Start with the data model**: Getting the MongoDB schema right early saved massive refactoring later
- **Two auth layers**: REST auth middleware AND WebSocket auth middleware — don't assume one covers both
- **Idempotent operations**: Always design API endpoints to be safely callable multiple times (the $pull + $push pattern)
- **Error boundaries**: Process-level error handlers (`uncaughtException`, `unhandledRejection`) prevent silent crashes in production
- **Frontend-backend contract**: Inconsistent response formats between endpoints caused frontend bugs — standardize early

---

## 14. Future Improvements

1. **Message pagination**: Load messages in batches of 50 with infinite scroll — prevents loading 10K messages on room entry
2. **Redis caching**: Cache trending polls, active room counts — reduce MongoDB load
3. **Rate limiting**: Add Express rate limiter middleware (express-rate-limit + Redis store) — prevent brute force attacks
4. **Password hashing for private rooms**: Use bcrypt instead of plain text comparison
5. **Typing indicators**: Emit 'typing' WebSocket events with debounce — show "User X is typing..."
6. **Voice/Video debates**: Integrate WebRTC via PeerJS for live audio debates
7. **Debate scoring/judging**: Let audience vote on which team won — automated scoring system
8. **Notification system**: Email/push notifications when invited to a debate or poll ends
9. **Server-side pagination**: Add `?page=1&limit=20` to all listing endpoints
10. **Docker containerization**: `docker-compose.yml` with Node + MongoDB for one-command local setup
11. **Automated testing**: Jest for backend API tests, React Testing Library for frontend components
12. **Observability**: Structured logging (Winston/Pino), error tracking (Sentry), uptime monitoring
# DEB8 — Interview Guide (Part 4): Questions, Verbal Answers

---

## 15. Interview Follow-up Questions

### Beginner Questions
1. **What is JWT and why did you use it over sessions?**
   → JWT is stateless — token contains user info, no server-side session storage needed. Essential for WebSocket apps where sticky sessions complicate scaling.

2. **What is CORS and how did you handle it?**
   → CORS restricts which domains can call my API. I whitelisted `mydeb8.netlify.app` in both Express middleware and Socket.io server config.

3. **Why MongoDB over PostgreSQL?**
   → Rooms have different shapes (debates vs. polls, 2v2 vs free-for-all). MongoDB's flexible schema handles this without separate tables. Messages embedded inside rooms eliminates JOINs.

4. **How does bcrypt work?**
   → It hashes the password with a random salt and configurable cost factor (10 rounds). Even if the database leaks, passwords can't be reversed. `bcrypt.compare()` re-hashes the input with the stored salt and compares.

5. **What's the difference between REST and WebSocket?**
   → REST is request-response — client asks, server responds. WebSocket is persistent bidirectional — server can push data to client without a request. I use REST for CRUD (create room, login), WebSocket for real-time (messages, user joins).

6. **What is React Context and when should you use it?**
   → Context provides global state without prop drilling. I use it for auth state (user, login, logout) which every component needs. I don't use it for local UI state — that stays in useState.

### Intermediate Questions

7. **How does Socket.io room management work?**
   → `socket.join(roomId)` adds a socket to a named room. `io.to(roomId).emit('message', data)` broadcasts to all sockets in that room. It's like a pub/sub channel — only room members receive events.

8. **How did you handle vote consistency?**
   → Three scenarios: first vote (add), change vote (remove old + add new), toggle (remove). Used MongoDB atomic operations ($pull + $push). `markModified()` for Mongoose Mixed types. `Promise.all()` for parallel poll + profile saves.

9. **What happens when a user disconnects unexpectedly?**
   → Socket.io fires 'disconnect' event. Server iterates through all rooms the socket was in, removes user from participants array, saves to DB, emits 'userLeft' to remaining users.

10. **How do you protect against unauthorized WebSocket access?**
    → `io.use()` middleware extracts JWT from `socket.handshake.auth.token`, verifies with `jwt.verify()`. Unauthenticated connections are rejected before they can emit/receive any events.

11. **Why did you use embedded documents for messages instead of a separate collection?**
    → Read optimization — one `findOne()` returns room + messages together. No JOIN needed. Tradeoff: MongoDB has 16MB document limit per document, so at scale I'd need to extract messages to a separate collection with pagination.

12. **How does your Axios interceptor pattern work?**
    → Request interceptor: reads JWT from localStorage, attaches as `Authorization: Bearer <token>` on every request. Response interceptor: catches 401 errors, clears token, redirects to login. Centralized auth logic — routes don't handle tokens individually.

### Advanced / Production-Level Questions

13. **How would you scale WebSocket to 1M concurrent connections?**
    → Socket.io Redis adapter — multiple Node.js instances share room state via Redis pub/sub. AWS ALB with sticky sessions for WebSocket upgrade. Horizontal autoscaling based on connection count. Each instance handles ~10K connections.

14. **Your messages are embedded — what's your migration strategy when you hit the 16MB limit?**
    → Create a separate Messages collection indexed by roomId. Migrate existing embedded messages via a script. Update API to query Messages collection with pagination (`skip` + `limit`). Keep last 50 messages embedded as a cache, full history in Messages collection.

15. **How would you implement end-to-end encryption for private rooms?**
    → Client generates AES key, shares via Diffie-Hellman key exchange through the server. Messages encrypted on client before emitting, decrypted on receiving client. Server stores only ciphertext — can't read messages. Key management is the hard part.

16. **What's your strategy for preventing denial-of-service on the voting endpoint?**
    → Redis-backed rate limiter: max 10 votes/minute per user per poll. Token bucket algorithm. Also: server-side validation of vote legitimacy (poll not expired, user hasn't been banned), Captcha on rapid successive votes.

17. **How would you add real-time analytics (live viewer count, message rate)?**
    → Publish metrics to Redis on every join/message. Separate analytics worker subscribes to Redis, aggregates in time windows, stores in time-series collection. Dashboard queries aggregated data — never counts raw events in real-time.

18. **Your room password is stored in plain text. Walk me through the fix.**
    → On room creation: `bcrypt.hash(password, 10)` before saving. On join: `bcrypt.compare(inputPassword, room.password)`. Remove password from all API responses (`select('-password')`). Migration script to hash existing passwords.

---

## 16. Best Verbal Explanation Versions

### 30-Second Version
> "DEB8 is a real-time debate and polling platform I built full-stack. Users create structured debate rooms — either 2v2 team format or free-for-all — and live polls with timed voting. The real-time messaging uses Socket.io for instant delivery, the backend is Express with MongoDB, authentication is JWT-based, and it's deployed on Netlify and Render. The core engineering challenge was handling real-time WebSocket communication alongside REST APIs with consistent authentication across both."

### 1-Minute Version
> "DEB8 is a full-stack real-time platform for structured online debates and live polls. I built it because existing platforms like Discord don't offer purpose-built debate formats — I wanted team-based 2v2 debates with role assignment, audience participation, and private rooms.
>
> The frontend is React with Vite, Tailwind CSS, and Framer Motion for animations. Backend is Express with Socket.io for real-time messaging and JWT for stateless authentication. MongoDB with Mongoose as the database — I chose NoSQL because debate rooms and polls have different shapes, and messages are embedded inside room documents for fast reads.
>
> The trickiest engineering problems were: syncing authentication across REST and WebSocket — I had to add separate JWT verification in Socket.io middleware. Vote consistency — handling first votes, changed votes, and vote toggles atomically. And Mongoose's Mixed type not triggering change detection — required explicit `markModified()` calls.
>
> It's deployed with Netlify for frontend and Render for backend, with MongoDB Atlas as the managed database."

### 3-Minute Deep Version
> "DEB8 is a full-stack real-time debate and polling platform. The problem I identified was that online discussions today — Twitter, Reddit — are unstructured chaos. There's no format for organized debates. I built a platform where you can create 2v2 team debates with team assignments and role-based participation, free-for-all open discussions, and live polls with time-limited voting and real-time result tracking.
>
> **Architecture**: It's a three-tier architecture. React SPA on the frontend with Vite for the build system, Tailwind CSS for styling, and Material-UI components. Backend is a Node.js Express server with two communication channels — REST APIs for CRUD operations using Axios, and WebSocket via Socket.io for real-time features like chat and user presence. MongoDB Atlas as the database with Mongoose ODM.
>
> **Authentication**: JWT-based, stateless. On login, server verifies password with bcrypt, generates a 7-day JWT, client stores in localStorage. Axios request interceptor attaches the token on every API call. Critically, I also authenticate WebSocket connections — Socket.io's `io.use()` middleware verifies the JWT from the handshake before allowing any socket events. On 401, the Axios response interceptor clears the token and redirects to login automatically.
>
> **Database Design**: I chose MongoDB because my data has variable shapes. A debate room has teams, participants, messages, a status lifecycle. A poll has options, vote counts, user vote mappings. Embedding messages inside the Room document gives me single-query room loads — no JOINs. The tradeoff is MongoDB's 16MB document limit, which means at scale I'd extract messages to a separate collection with pagination.
>
> **Core Technical Challenges**: First, Mongoose's Mixed type issue — votes and userVotes are plain Objects, and Mongoose doesn't detect changes to nested Object properties. My votes silently weren't saving until I added `markModified()`. Second, duplicate participants — concurrent join requests caused duplicates because `$push` doesn't check for existing entries. Fixed with `$pull` before `$push` to make it idempotent. Third, CORS — it wasn't enough to configure Express CORS middleware, I also had to configure it separately on the Socket.io server.
>
> **Deployment**: Frontend on Netlify with a `_redirects` file for SPA routing, backend on Render with environment variables for secrets, MongoDB Atlas for managed database. The main production challenge is Render's free tier cold starts — 30-50 second first-request latency after inactivity.
>
> **If I were scaling this**: Socket.io Redis adapter for horizontal WebSocket scaling, extract messages to a separate collection, Redis caching for trending polls, rate limiting to prevent abuse, and eventually microservice decomposition — Auth, Chat, Room, and Poll services independently scalable."

---

## 17. Final Strong Interview Answer

> "I built DEB8, a real-time debate and polling platform, as a full-stack project to solve the problem of unstructured online discussions. Unlike generic chat apps, DEB8 offers purpose-built debate formats — structured 2v2 team debates with team assignments, free-for-all rooms, private password-protected rooms, and live polls with timed voting.
>
> The architecture is a React SPA frontend built with Vite and Tailwind CSS, communicating with an Express.js backend through two channels: REST APIs via Axios for standard CRUD, and WebSocket via Socket.io for real-time messaging and user presence. Authentication is JWT-based — I implemented it across both REST middleware and Socket.io handshake middleware to ensure no unauthenticated WebSocket connections.
>
> I chose MongoDB because the data is inherently polymorphic — debate rooms and polls have different shapes, and I embed messages inside room documents to avoid expensive JOINs. Mongoose ODM handles schema validation and cross-collection references via populate.
>
> The most valuable engineering lessons came from the edge cases: Mongoose's Mixed type not triggering change detection for vote updates, which I solved with `markModified()`. Concurrent participant joins causing duplicates, which I fixed by making the operation idempotent with `$pull` before `$push`. And deploying across two platforms — Netlify and Render — where CORS had to be configured at multiple layers including the Socket.io server.
>
> For production, I'd add Redis caching for trending polls, server-side pagination for message history, rate limiting for the voting endpoint, bcrypt hashing for private room passwords, and Socket.io Redis adapter for horizontal WebSocket scaling. The project taught me that real-time systems require a different mindset from request-response — you're managing persistent connections, event-driven state, and concurrent access patterns that don't exist in traditional REST APIs."
