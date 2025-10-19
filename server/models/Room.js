import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  topic: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: String,
  format: {
    type: String,
    enum: ['debate', 'poll'],
    required: true
  },
  debateType: {
    type: String,
    enum: ['2vs2', 'freeForAll'],
    required: function() {
      return this.format === 'debate';
    }
  },
  status: {
    type: String,
    enum: ['LIVE', 'ENDED', 'SCHEDULED'],
    default: 'LIVE'
  },
  createdBy: String,
  team1: {
    name: String,
    description: String,
    members: [String],
    maxDebaters: {
      type: Number,
      default: 2
    }
  },
  team2: {
    name: String,
    description: String,
    members: [String],
    maxDebaters: {
      type: Number,
      default: 2
    }
  },
  participants: [{
    userId: String,
    username: String,
    role: {
      type: String,
      enum: ['debater', 'audience'],
      default: 'debater'
    },
    team: {
      type: String,
      enum: ['team1', 'team2', null],
      default: null
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [{
    content: {
      type: String,
      required: true
    },
    userId: String,
    username: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['debate', 'audience'],
      default: 'debate'
    },
    team: {
      type: String,
      enum: ['team1', 'team2', null],
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: String
});

const Room = mongoose.model('Room', roomSchema);
export default Room; 