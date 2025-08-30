import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import HomePage from './components/HomePage';
import GameRoom from './components/GameRoom';
import PollPage from './components/PollPage';

interface Player {
  id: string;
  name: string;
  connected: boolean;
}

interface GameState {
  phase: 'waiting' | 'drafting' | 'teamBuilding' | 'voting' | 'completed';
  currentTurn: number;
  shuffledCharacters: (string | null)[];
  selectedCharacters: {
    player1: string[];
    player2: string[];
  };
  teams: {
    player1: TeamComposition;
    player2: TeamComposition;
  };
  pollId?: string;
}

interface TeamComposition {
  captain?: string;
  viceCaptain?: string;
  tank?: string;
  healer?: string;
  support1?: string;
  support2?: string;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'game' | 'poll'>('home');
  const [roomId, setRoomId] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    phase: 'waiting',
    currentTurn: 0,
    shuffledCharacters: [],
    selectedCharacters: { player1: [], player2: [] },
    teams: { player1: {}, player2: {} }
  });
  const [pollId, setPollId] = useState<string>('');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/poll/')) {
      const id = path.split('/')[2];
      setPollId(id);
      setCurrentPage('poll');
    }
  }, []);

  useEffect(() => {
    if (currentPage === 'game' && roomId && playerId) {
      const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const newSocket = io(API_URL);

      setSocket(newSocket);

      newSocket.emit('join-game', { roomId, playerId });

      newSocket.on('room-info', (data) => {
        setPlayers(data.players);
      });

      newSocket.on('game-state', (state) => {
        setGameState(state);
      });

      newSocket.on('game-started', (state) => {
        setGameState(state);
      });

      newSocket.on('character-selected', (state) => {
        setGameState(state);
      });

      newSocket.on('team-updated', (data) => {
        setGameState(prev => ({
          ...prev,
          teams: {
            ...prev.teams,
            [data.player]: data.team
          }
        }));
      });

      newSocket.on('poll-created', (data) => {
        setGameState(data.gameState);
        window.open(data.pollUrl, '_blank');
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentPage, roomId, playerId]);

  const joinGame = (roomId: string, playerId: string) => {
    setRoomId(roomId);
    setPlayerId(playerId);
    setCurrentPage('game');
  };

  if (currentPage === 'poll') {
    return <PollPage pollId={pollId} />;
  }

  if (currentPage === 'game') {
    return (
      <GameRoom
        socket={socket}
        roomId={roomId}
        playerId={playerId}
        players={players}
        gameState={gameState}
        onBack={() => setCurrentPage('home')}
      />
    );
  }

  return (
    <HomePage onJoinGame={joinGame} />
  );
}

export default App;