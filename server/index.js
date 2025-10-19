import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Room from './models/Room.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://mydeb8.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
    credentials: true
  }
});

// Configure CORS middleware
app.use(cors({
  origin: "https://mydeb8.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
 allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
  credentials: true
}));

app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'DEB8 API Server is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      rooms: '/api/rooms',
      polls: '/api/polls',
      users: '/api/users'
    }
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Poll Schema
const pollSchema = new mongoose.Schema({
  pollId: { type: String, required: true, unique: true },
  question: { type: String, required: true },
  options: { type: Map, of: String, required: true },
  votes: { type: Object, default: {} },
  userVotes: { type: Object, default: {} },
  category: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// User Profile Schema
const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  pollsParticipated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Poll' }],
  pollsParticipatedCount: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);
const Poll = mongoose.model('Poll', pollSchema);
const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      username: decoded.username
    };
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Create user profile
    await UserProfile.create({
      userId: user._id,
      username: user.username,
      pollsParticipated: []
    });

    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email } 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email } 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Room Routes - My Rooms
app.get('/api/rooms/my-rooms', authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find({ createdBy: req.user.id })
      .populate('createdBy', 'username')
      .populate('participants', 'username')
      .sort({ createdAt: -1 })
      .lean();

    const formattedRooms = rooms.map(room => ({
      roomId: room.roomId,
      topic: room.topic,
      description: room.description,
      status: room.status,
      startTime: room.startTime,
      createdAt: room.createdAt,
      category: room.category,
      debateType: room.debateType,
      maxDebaters: room.maxDebaters,
      currentParticipants: room.participants?.length || 0,
      participants: room.participants?.map(p => ({
        id: p?._id || 'unknown',
        username: p?.username || 'Unknown'
      })) || [],
      messages: room.messages || [],
      team1: room.team1 || null,
      team2: room.team2 || null,
      format: room.format,
      createdBy: room.createdBy?.username || 'Unknown',
      isPrivate: room.isPrivate
    }));

    res.json(formattedRooms);
  } catch (error) {
    console.error('Error fetching my rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Room Routes - Debates
app.get('/api/rooms/debates', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    let query = { format: 'debate' };
    
    if (category && category !== 'All Debates') {
      query.category = category;
    }

    const rooms = await Room.find(query)
      .populate('createdBy', 'username')
      .populate('participants', 'username')
      .sort({ createdAt: -1 });

    const roomsWithStats = rooms.map(room => ({
      roomId: room.roomId,
      topic: room.topic,
      description: room.description,
      status: room.status,
      startTime: room.startTime,
      createdAt: room.createdAt,
      category: room.category,
      debateType: room.debateType,
      maxDebaters: room.maxDebaters,
      currentParticipants: room.participants?.length || 0,
      participants: room.participants?.map(p => ({
        id: p?._id || 'unknown',
        username: p?.username || 'Unknown'
      })) || [],
      messages: room.messages || [],
      createdBy: room.createdBy?.username || 'Unknown',
      isPrivate: room.isPrivate
    }));

    res.json(roomsWithStats);
  } catch (error) {
    console.error('Error fetching debate rooms:', error);
    res.status(500).json({ message: 'Failed to fetch debate rooms' });
  }
});

// Room Routes - Polls
app.get('/api/rooms/polls', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    const query = {
      format: 'poll',
      status: { $ne: 'TERMINATED' }
    };
    
    if (category && category !== 'All') {
      query.category = category;
    }

    const rooms = await Room.find(query)
      .populate('createdBy', 'username')
      .populate('participants', 'username')
      .select('-messages')
      .sort('-createdAt')
      .lean();

    const formattedRooms = rooms.map(room => ({
      roomId: room.roomId,
      topic: room.topic,
      description: room.description,
      category: room.category,
      status: room.status,
      startTime: room.startTime || room.createdAt,
      pollOptions: room.pollOptions,
      votes: room.votes || 0,
      participants: room.participants?.map(p => ({
        id: p?._id || 'unknown',
        username: p?.username || 'Unknown'
      })) || [],
      watching: room.watching,
      createdBy: room.createdBy?.username || 'Unknown',
      createdAt: room.createdAt,
      currentParticipants: room.participants?.length || 0
    }));

    res.json(formattedRooms);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Room Routes
app.post('/api/rooms', authenticateToken, async (req, res) => {
  try {
    const { 
      topic, 
      description, 
      category, 
      startTime, 
      maxDebaters, 
      format, 
      roomId,
      debateType,
      team1,
      team2
    } = req.body;
    
    console.log('Received room creation request:', req.body);
    
    if (!topic || !description || !category || !format || !roomId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['debate', 'poll'].includes(format)) {
      return res.status(400).json({ error: 'Invalid room format' });
    }

    if (format === 'debate' && !debateType) {
      return res.status(400).json({ error: 'Debate type is required for debate rooms' });
    }

    if (format === 'debate' && !['2vs2', 'freeForAll'].includes(debateType)) {
      return res.status(400).json({ error: 'Invalid debate type' });
    }

    // Validate team data for 2vs2 debates
    if (format === 'debate' && debateType === '2vs2') {
      if (!team1?.name || !team1?.description || !team2?.name || !team2?.description) {
        return res.status(400).json({ error: 'Team names and descriptions are required for 2vs2 debates' });
      }
    }

    try {
      // Create the initial room without participants
      const room = new Room({
        roomId,
        topic,
        description,
        category,
        format,
        debateType: format === 'debate' ? debateType : undefined,
        status: 'LIVE',
        startTime: new Date(),
        createdBy: req.user._id.toString(),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPrivate: req.body.isPrivate || false,
        password: req.body.isPrivate && req.body.password ? req.body.password : undefined
      });

      // Add team information for 2vs2 debates
      if (format === 'debate' && debateType === '2vs2') {
        room.team1 = {
          name: team1.name,
          description: team1.description,
          members: [],
          maxDebaters: team1.maxDebaters || 2
        };
        room.team2 = {
          name: team2.name,
          description: team2.description,
          members: [],
          maxDebaters: team2.maxDebaters || 2
        };
      }

      // Save the room first
      await room.save();
      
      // Now add the user to participants separately to avoid validation errors
      room.participants = [{
        userId: req.user._id.toString(),
        username: req.user.username,
        role: 'debater',
        team: null,
        joinedAt: new Date()
      }];
      
      // Save again with participants
      await room.save();
      
      console.log('Room saved successfully');
      res.status(201).json({ success: true, roomId: room.roomId });
    } catch (saveError) {
      console.error('Error saving room:', saveError);
      res.status(500).json({ error: 'Failed to save room', details: saveError.message });
    }
  } catch (error) {
    console.error('Detailed error creating room:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create room', details: error.message });
  }
});

app.get('/api/rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('createdBy', 'username')
      .populate('participants', 'username')
      .lean();

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Format the response
    const formattedRoom = {
      ...room,
      participants: room.participants.map(p => ({
        id: p._id,
        username: p.username
      })),
      messages: room.messages || [],
      createdBy: room.createdBy?.username || 'Unknown'
    };

    console.log('Sending room data with messages:', formattedRoom.messages.length);
    res.json({ success: true, room: formattedRoom });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch room data' });
  }
});

app.get('/api/rooms', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { createdBy: req.user.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const rooms = await Room.find(query)
      .populate('createdBy', 'username')
      .select('roomId topic description category format status participants messages createdAt debateType maxDebaters pollOptions')
      .sort('-createdAt')
      .lean();

    const formattedRooms = rooms.map(room => ({
      id: room._id,
      roomId: room.roomId,
      topic: room.topic,
      description: room.description,
      category: room.category,
      format: room.format,
      status: room.status,
      debateType: room.debateType,
      maxDebaters: room.maxDebaters,
      currentParticipants: room.participants?.length || 0,
      messages: room.messages,
      pollOptions: room.pollOptions,
      createdBy: room.createdBy?.username || 'Unknown',
      createdAt: room.createdAt
    }));

    res.json(formattedRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/rooms/:roomId/join', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { role, team, password } = req.body;
    const userId = req.user.id;

    const room = await Room.findOne({ roomId })
      .populate('createdBy', 'username')
      .populate('participants', 'username')
      .lean();

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is already a participant
    const existingParticipant = room.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      // If user is already in the room, return success with current role
      return res.json({ 
        success: true, 
        message: 'Already in room',
        room: {
          ...room,
          participants: room.participants.map(p => ({
            id: p._id,
            username: p.username,
            role: p.role,
            team: p.team
          })),
          messages: room.messages || [],
          createdBy: room.createdBy?.username || 'Unknown'
        }
      });
    }

    // Check if room is full
    if (room.participants.length >= room.maxDebaters) {
      return res.status(400).json({ message: 'Room is full' });
    }

    // Check if room is private and password is required
    if (room.isPrivate) {
      if (!password) {
        return res.status(400).json({ message: 'Password is required for this private room' });
      }
      if (password !== room.password) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
      // If this is just a password check, don't add participant
      if (role === 'check') {
        return res.json({ success: true, message: 'Password correct' });
      }
    }

    // Remove any previous entries for this user before adding
    await Room.findOneAndUpdate(
      { roomId },
      { $pull: { participants: { userId } } }
    );

    // Create new participant object
    const newParticipant = {
      userId: userId,
      username: req.user.username,
      role: role || 'audience',
      team: team || null,
      joinedAt: new Date()
    };

    // Add new participant to the room
    await Room.findOneAndUpdate(
      { roomId },
      { $push: { participants: newParticipant } }
    );

    // Get updated room data
    const updatedRoom = await Room.findOne({ roomId })
      .populate('createdBy', 'username')
      .populate('participants', 'username')
      .lean();

    // Format the response
    const formattedRoom = {
      ...updatedRoom,
      participants: updatedRoom.participants.map(p => ({
        id: p._id,
        username: p.username,
        role: p.role,
        team: p.team
      })),
      messages: updatedRoom.messages || [],
      createdBy: updatedRoom.createdBy?.username || 'Unknown'
    };

    res.json({ 
      success: true, 
      message: 'Successfully joined room',
      room: formattedRoom
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ message: 'Failed to join room' });
  }
});

app.delete('/api/rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (room.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only room creator can delete the room' });
    }
    
    await Room.findByIdAndDelete(room._id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Poll Routes - My Polls
app.get('/api/polls/my-polls', authenticateToken, async (req, res) => {
  try {
    const polls = await Poll.find({ createdBy: req.user.id })
      .populate('createdBy', 'username')
      .sort('-createdAt')
      .lean();

    const formattedPolls = polls.map(poll => ({
      pollId: poll.pollId,
      question: poll.question,
      options: poll.options,
      votes: poll.votes || {},
      userVotes: poll.userVotes || {},
      category: poll.category,
      createdBy: poll.createdBy?.username || 'Unknown',
      endDate: poll.endDate,
      createdAt: poll.createdAt,
      totalVotes: Object.values(poll.votes || {}).reduce((sum, count) => sum + count, 0)
    }));

    res.json({ polls: formattedPolls });
  } catch (error) {
    console.error('Error fetching user polls:', error);
    res.status(500).json({ message: 'Failed to fetch user polls' });
  }
});

// Poll Routes
app.post('/api/polls', authenticateToken, async (req, res) => {
  try {
    const { question, options, category, endDate } = req.body;
    
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Invalid poll data' });
    }

    const pollId = Math.random().toString(36).substring(2, 15);
    const optionsMap = {};
    const votesMap = {};
    
    options.forEach((option, index) => {
      optionsMap[index] = option;
      votesMap[index] = 0;
    });

    const poll = await Poll.create({
      pollId,
      question,
      options: optionsMap,
      votes: votesMap,
      category: category || 'General',
      createdBy: req.user.id,
      endDate: new Date(endDate)
    });

    res.status(201).json({ success: true, poll });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ message: 'Failed to create poll' });
  }
});

app.get('/api/polls', authenticateToken, async (req, res) => {
  try {
    const polls = await Poll.find()
      .populate('createdBy', 'username')
      .sort('-createdAt')
      .lean();

    const formattedPolls = polls.map(poll => ({
      pollId: poll.pollId,
      question: poll.question,
      options: poll.options,
      votes: poll.votes || {},
      userVotes: poll.userVotes || {},
      category: poll.category,
      createdBy: poll.createdBy?.username || 'Unknown',
      endDate: poll.endDate,
      createdAt: poll.createdAt
    }));

    res.json({ polls: formattedPolls });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ message: 'Failed to fetch polls' });
  }
});

app.get('/api/polls/trending', async (req, res) => {
  try {
    const polls = await Poll.find()
      .populate('createdBy', 'username')
      .lean();

    // Calculate total votes for each poll and sort
    const pollsWithTotalVotes = polls.map(poll => ({
      ...poll,
      totalVotes: Object.values(poll.votes || {}).reduce((sum, count) => sum + (count || 0), 0)
    }));

    // Sort by total votes in descending order and take top 8
    const sortedPolls = pollsWithTotalVotes
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .slice(0, 8);

    const formattedPolls = sortedPolls.map(poll => ({
      pollId: poll.pollId,
      question: poll.question,
      options: poll.options,
      votes: poll.votes || {},
      userVotes: poll.userVotes || {},
      category: poll.category,
      createdBy: poll.createdBy?.username || 'Unknown',
      endDate: poll.endDate,
      createdAt: poll.createdAt,
      totalVotes: poll.totalVotes
    }));

    res.json({ polls: formattedPolls });
  } catch (error) {
    console.error('Error fetching trending polls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/polls/:pollId/vote', authenticateToken, async (req, res) => {
  try {
    const { pollId } = req.params;
    const { option, userId } = req.body;

    console.log('Vote request:', { pollId, option, userId });

    const poll = await Poll.findOne({ pollId });
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if poll has ended
    if (new Date(poll.endDate) <= new Date()) {
      return res.status(400).json({ message: 'Poll has ended' });
    }

    // Initialize votes and userVotes if they don't exist
    poll.votes = poll.votes || {};
    poll.userVotes = poll.userVotes || {};

    console.log('Before update - votes:', poll.votes, 'userVotes:', poll.userVotes);

    // Get or create user profile
    let userProfile = await UserProfile.findOne({ userId: req.user.id });
    if (!userProfile) {
      userProfile = await UserProfile.create({
        userId: req.user.id,
        username: req.user.username,
        pollsParticipated: [],
        pollsParticipatedCount: 0
      });
    }

    // Check if this is the user's first vote on this poll
    const isFirstVote = !poll.userVotes[userId];

    // If user has already voted for this option, remove their vote
    if (poll.userVotes[userId] === option) {
      // Remove vote if clicking the same option
      poll.votes[option] = Math.max(0, (poll.votes[option] || 0) - 1);
      delete poll.userVotes[userId];
      
      // Remove poll from participated list and decrease count
      userProfile.pollsParticipated = userProfile.pollsParticipated.filter(p => !p.equals(poll._id));
      userProfile.pollsParticipatedCount = Math.max(0, userProfile.pollsParticipatedCount - 1);
      
      console.log('Removed vote for option:', option);
    } else {
      // If user has voted for a different option, remove that vote first
      if (poll.userVotes[userId] !== undefined) {
        const previousVote = poll.userVotes[userId];
        poll.votes[previousVote] = Math.max(0, (poll.votes[previousVote] || 0) - 1);
        console.log('Removed previous vote:', previousVote);
      } else if (isFirstVote) {
        // If this is user's first vote on this poll, add to participated list
        if (!userProfile.pollsParticipated.includes(poll._id)) {
          userProfile.pollsParticipated.push(poll._id);
          userProfile.pollsParticipatedCount += 1;
        }
      }
      // Add new vote
      poll.votes[option] = (poll.votes[option] || 0) + 1;
      poll.userVotes[userId] = option;
      console.log('Added new vote for option:', option);
    }

    // Mark the fields as modified
    poll.markModified('votes');
    poll.markModified('userVotes');

    // Save both the poll and user profile
    await Promise.all([
      poll.save(),
      userProfile.save()
    ]);

    console.log('After update - votes:', poll.votes, 'userVotes:', poll.userVotes);

    // Convert options Map to plain object
    const optionsObj = {};
    poll.options.forEach((value, key) => {
      optionsObj[key] = value;
    });

    // Prepare response data
    const responseData = {
      success: true,
      poll: {
        pollId: poll.pollId,
        question: poll.question,
        options: optionsObj,
        votes: poll.votes,
        userVotes: poll.userVotes,
        endDate: poll.endDate
      }
    };

    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ message: 'Failed to record vote' });
  }
});

function getTimeLeft(endDate) {
  const now = new Date();
  const diff = endDate - now;
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} days left`;
  if (hours > 0) return `${hours} hours left`;
  
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes} minutes left`;
}

// Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('joinRoom', async ({ roomId, userId }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      socket.join(roomId);
      socket.emit('joinedRoom', { roomId, message: 'Successfully joined room' });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('getRoomData', async ({ roomId }) => {
    try {
      const room = await Room.findOne({ roomId })
        .populate('createdBy', 'username')
        .populate('participants', 'username')
        .lean();

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Format the response
      const formattedRoom = {
        ...room,
        participants: room.participants.map(p => ({
          id: p._id,
          username: p.username
        })),
        messages: room.messages || [],
        createdBy: room.createdBy?.username || 'Unknown'
      };

      console.log('Sending room data with messages:', formattedRoom.messages.length);
      socket.emit('roomData', formattedRoom);
    } catch (error) {
      console.error('Error fetching room data:', error);
      socket.emit('error', { message: 'Failed to fetch room data' });
    }
  });

  socket.on('message', async (msg, callback) => {
    try {
      const { roomId, content, type, userId, username, team } = msg;
      console.log(`[SOCKET] Message received for roomId=${roomId}, userId=${userId}, type=${type}, team=${team}, content=${content}`);
      if (!roomId || !content || !userId || !username) {
        console.error('[SOCKET] Missing required fields for message');
        if (callback) callback({ error: 'Missing required fields' });
        return;
      }
      const room = await Room.findOne({ roomId });
      if (!room) {
        console.error(`[SOCKET] Room not found for roomId=${roomId}`);
        if (callback) callback({ error: 'Room not found' });
        return;
      }

      // Create message object with all required fields
      const message = {
        content,
        userId,
        username,
        type: type || 'debate',
        team,
        timestamp: new Date()
      };
      
      // Add message to room's messages array
      room.messages.push(message);
      await room.save();
      
      // Broadcast message to all clients in the room
      io.to(roomId).emit('message', message);
      
      if (callback) callback({ success: true });
    } catch (error) {
      console.error('[SOCKET] Error processing message:', error);
      if (callback) callback({ error: 'Failed to process message' });
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected');
    try {
      // Get all rooms the socket was in
      const rooms = Array.from(socket.rooms);
      for (const roomId of rooms) {
        if (roomId !== socket.id) { // Skip the socket's own room
          const room = await Room.findOne({ roomId });
          if (room) {
            // Remove the user from participants
            const userId = socket.handshake.auth.userId;
            room.participants = room.participants.filter(p => p.toString() !== userId.toString());
            await room.save();
            
            // Notify other users in the room
            io.to(roomId).emit('userLeft', { userId });
          }
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// User Profile Routes
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    // First try to find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get active polls created by the user
    const activePolls = await Poll.find({
      createdBy: req.user.id,
      endDate: { $gt: new Date() } // Only count polls that haven't ended yet
    });

    // Get user profile for participation count
    const userProfile = await UserProfile.findOne({ userId: req.user.id });
    const pollsParticipatedCount = userProfile?.pollsParticipatedCount || 0;

    // Return formatted response
    res.json({
      username: user.username,
      createdAt: user.createdAt,
      pollCount: activePolls.length,
      pollsParticipatedCount
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    
    // Update username in User model
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get active polls count
    const activePolls = await Poll.find({
      createdBy: req.user.id,
      endDate: { $gt: new Date() }
    });

    res.json({
      username: updatedUser.username,
      createdAt: updatedUser.createdAt,
      pollCount: activePolls.length
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// New Room Routes
app.post('/api/rooms/:roomId/terminate', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only room creator can terminate the room' });
    }

    room.status = 'TERMINATED';
    await room.save();

    io.to(req.params.roomId).emit('roomTerminated', {
      roomId: req.params.roomId,
      terminatedBy: req.user.username
    });

    res.json({ message: 'Room terminated successfully' });
  } catch (error) {
    console.error('Room termination error:', error);
    res.status(500).json({ message: 'Failed to terminate room' });
  }
});

app.post('/api/rooms/:roomId/kick', authenticateToken, async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only room creator can kick users' });
    }

    const kickedUser = await User.findById(userId);
    if (!kickedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove user from participants
    room.participants = room.participants.filter(p => p.toString() !== userId);
    
    // Add to kicked users list
    room.kickedUsers.push({
      userId,
      username: kickedUser.username,
      reason,
      timestamp: new Date()
    });

    await room.save();

    io.to(req.params.roomId).emit('userKicked', {
      userId,
      username: kickedUser.username,
      reason,
      kickedBy: req.user.username
    });

    res.json({ message: 'User kicked successfully' });
  } catch (error) {
    console.error('User kick error:', error);
    res.status(500).json({ message: 'Failed to kick user' });
  }
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Add process error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.delete('/api/polls/:pollId', authenticateToken, async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollId: req.params.pollId });
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    
    if (poll.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only poll creator can delete the poll' });
    }

    // Get all users who participated in this poll
    const userIds = Object.keys(poll.userVotes || {});
    
    // Update participation counts for all affected users
    if (userIds.length > 0) {
      await UserProfile.updateMany(
        { userId: { $in: userIds } },
        { 
          $pull: { pollsParticipated: poll._id },
          $inc: { pollsParticipatedCount: -1 }
        }
      );
    }
    
    await Poll.findByIdAndDelete(poll._id);
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(400).json({ message: error.message });
  }
});

// Add leave room endpoint
app.post('/api/rooms/:roomId/leave', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Remove user from participants
    room.participants = room.participants.filter(p => p.userId !== userId);
    await room.save();

    // Notify other users in the room
    io.to(roomId).emit('userLeft', { userId });

    res.json({ success: true, message: 'Successfully left room' });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ message: 'Failed to leave room' });
  }
});

// User Debate & Poll History - all rooms where user is a participant
app.get('/api/rooms/user-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all rooms where the user is a participant
    const rooms = await Room.find({ 'participants.userId': userId })
      .populate('createdBy', 'username')
      .populate('participants', 'username')
      .sort({ createdAt: -1 })
      .lean();

    const formattedRooms = rooms.map(room => ({
      roomId: room.roomId,
      topic: room.topic,
      description: room.description,
      category: room.category,
      format: room.format,
      status: room.status,
      debateType: room.debateType,
      maxDebaters: room.maxDebaters,
      currentParticipants: room.participants?.length || 0,
      participants: room.participants?.map(p => ({
        id: p?._id || 'unknown',
        username: p?.username || 'Unknown'
      })) || [],
      messages: room.messages || [],
      createdBy: room.createdBy?.username || 'Unknown',
      createdAt: room.createdAt
    }));

    res.json({ rooms: formattedRooms });
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Room Routes - User History
app.get('/api/rooms/user-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Find rooms where the user is a participant
    const rooms = await Room.find({ 'participants.userId': userId })
      .sort({ createdAt: -1 })
      .lean();

    // Map to include only relevant info and the user's role/team in each room
    const formattedRooms = rooms.map(room => {
      const participant = room.participants.find(p => p.userId === userId);
      return {
        roomId: room.roomId,
        topic: room.topic,
        description: room.description,
        category: room.category,
        status: room.status,
        startTime: room.startTime,
        createdAt: room.createdAt,
        debateType: room.debateType,
        format: room.format,
        userRole: participant?.role || null,
        userTeam: participant?.team || null
      };
    });

    res.json({ rooms: formattedRooms });
  } catch (error) {
    console.error('Error fetching user room history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
