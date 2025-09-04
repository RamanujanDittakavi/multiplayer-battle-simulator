/*
Battle Simulator Real-Time Game
Copyright (c) 2025 Jagan Mohan Rao Kolli
Licensed under the MIT License - see the LICENSE file for details.
*/

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Datastore from 'nedb-promises';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const roomsDb = Datastore.create({ filename: './data/rooms.db', autoload: true });
const pollsDb = Datastore.create({ filename: './data/polls.db', autoload: true });


// Naruto characters database
const narutoCharacters = [
  'Naruto Uzumaki', 'Sasuke Uchiha', 'Sakura Haruno', 'Kakashi Hatake', 
  'Rock Lee', 'Neji Hyuga', 'Tenten', 'Might Guy', 'Shikamaru Nara', 
  'Ino Yamanaka', 'Choji Akimichi', 'Asuma Sarutobi', 'Hinata Hyuga', 
  'Kiba Inuzuka', 'Shino Aburame', 'Kurenai Yuhi', 'Gaara', 'Temari', 
  'Kankuro', 'Itachi Uchiha', 'Kisame Hoshigaki', 'Deidara', 'Sasori', 
  'Hidan', 'Kakuzu', 'Orochimaru', 'Kabuto Yakushi', 'Jiraiya', 
  'Tsunade', 'Minato Namikaze', 'Hashirama Senju', 'Tobirama Senju', 
  'Hiruzen Sarutobi', 'Danzo Shimura', 'Shisui Uchiha', 'Obito Uchiha', 
  'Madara Uchiha', 'Pain/Nagato', 'Konan', 'Yamato', 'Sai', 'Killer Bee', 
  'A (Fourth Raikage)', 'Darui', 'Mei Terumi', 'Chojuro', 'Onoki', 
  'Kurotsuchi', 'Kimimaro', 'Zabuza Momochi', 'Haku', 'Tsunade'
];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// API Routes
app.post('/api/create-room', async (req, res) => {
  try {
    const { playerName, password } = req.body;
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const room = {
      roomId,
      password,
      players: [{
        id: uuidv4(),
        name: playerName,
        connected: false
      }],
      gameState: {
        phase: 'waiting',
        currentTurn: 0,
        shuffledCharacters: [],
        selectedCharacters: { player1: [], player2: [] },
        teams: {
          player1: {},
          player2: {}
        }
      }
    };
    
    await roomsDb.insert(room);
    res.json({ roomId, playerId: room.players[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/join-room', async (req, res) => {
  try {
    const { roomId, playerName, password } = req.body;
    const room = await roomsDb.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    if (room.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    if (room.players.length >= 2) {
      return res.status(400).json({ error: 'Room is full' });
    }
    
    const playerId = uuidv4();
    room.players.push({
      id: playerId,
      name: playerName,
      connected: false
    });
    
    await roomsDb.update({ roomId }, room);
    res.json({ roomId, playerId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/poll/:pollId', async (req, res) => {
  try {
    const poll = await pollsDb.findOne({ pollId: req.params.pollId });
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vote/:pollId', async (req, res) => {
  try {
    const { vote } = req.body;
    const voterIP = req.ip;
    
    const poll = await pollsDb.findOne({ pollId: req.params.pollId });
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    if (poll.voters.includes(voterIP)) {
      return res.status(400).json({ error: 'Already voted' });
    }
    
    poll.voters.push(voterIP);
    if (vote === 'player1') {
      poll.votes.player1++;
    } else {
      poll.votes.player2++;
    }
    
    await pollsDb.update({ pollId: req.params.pollId }, poll);
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-game', async (data) => {
    try {
      const { roomId, playerId } = data;
      const room = await roomsDb.findOne({ roomId });
      
      if (room) {
        socket.join(roomId);
        
        // Update player connection status
        const player = room.players.find(p => p.id === playerId);
        if (player) {
          player.connected = true;
          await roomsDb.update({ roomId }, room);
        }
        
        socket.emit('game-state', room.gameState);
        socket.emit('room-info', {
          players: room.players,
          roomId: room.roomId
        });
        
        // Start game if both players connected
        if (room.players.length === 2 && room.players.every(p => p.connected) && room.gameState.phase === 'waiting') {
          room.gameState.phase = 'drafting';
          room.gameState.shuffledCharacters = shuffleArray(narutoCharacters).slice(0, 24); // 12 characters per player
          room.gameState.currentTurn = 0;
          await roomsDb.update({ roomId }, room);
          
          io.to(roomId).emit('game-started', room.gameState);
        }
      }
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
  
  socket.on('select-character', async (data) => {
    try {
      const { roomId, playerId, characterIndex } = data;
      const room = await roomsDb.findOne({ roomId });
      
      if (room && room.gameState.phase === 'drafting') {
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        const currentPlayer = room.gameState.currentTurn % 2;
        
        if (playerIndex === currentPlayer) {
          const character = room.gameState.shuffledCharacters[characterIndex];
          const playerKey = playerIndex === 0 ? 'player1' : 'player2';
          
          room.gameState.selectedCharacters[playerKey].push(character);
          room.gameState.shuffledCharacters[characterIndex] = null;
          room.gameState.currentTurn++;
          
          // Check if drafting is complete (24 picks total, 12 each)
          if (room.gameState.currentTurn >= 24) {
            room.gameState.phase = 'teamBuilding';
          }
          
          await roomsDb.update({ roomId }, room);
          io.to(roomId).emit('character-selected', room.gameState);
        }
      }
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
  
  socket.on('update-team', async (data) => {
    try {
      const { roomId, playerId, team } = data;
      const room = await roomsDb.findOne({ roomId });
      
      if (room && room.gameState.phase === 'teamBuilding') {
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        const playerKey = playerIndex === 0 ? 'player1' : 'player2';
        
        room.gameState.teams[playerKey] = team;
        await roomsDb.update({ roomId }, room);
        
        socket.to(roomId).emit('team-updated', {
          player: playerKey,
          team: team
        });
      }
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
  
  socket.on('finalize-teams', async (data) => {
    try {
      const { roomId } = data;
      const room = await roomsDb.findOne({ roomId });
      
      if (room && room.gameState.phase === 'teamBuilding') {
        // Create poll
        const pollId = uuidv4();
        const poll = {
          pollId,
          roomId,
          teams: {
            player1: {
              name: room.players[0].name,
              team: room.gameState.teams.player1
            },
            player2: {
              name: room.players[1].name,
              team: room.gameState.teams.player2
            }
          },
          // **THIS IS THE FIX**
          // Initialize votes and voters for the poll to function correctly.
          votes: {
            player1: 0,
            player2: 0
          },
          voters: []
        };
        
        await pollsDb.insert(poll);
        
        room.gameState.phase = 'voting';
        room.gameState.pollId = pollId;
        await roomsDb.update({ roomId }, room);
        
        const pollUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/poll/${pollId}`;
        
        io.to(roomId).emit('poll-created', {
          pollId,
          pollUrl,
          gameState: room.gameState
        });
      }
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
  
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    // Handle player disconnection logic here if needed
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});