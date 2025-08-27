import React from 'react';
import { Socket } from 'socket.io-client';
import WaitingRoom from './WaitingRoom';
import DraftingPhase from './DraftingPhase';
import TeamBuildingPhase from './TeamBuildingPhase';
import VotingPhase from './VotingPhase';

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

interface GameRoomProps {
  socket: Socket | null;
  roomId: string;
  playerId: string;
  players: Player[];
  gameState: GameState;
  onBack: () => void;
}

const GameRoom: React.FC<GameRoomProps> = ({
  socket,
  roomId,
  playerId,
  players,
  gameState,
  onBack
}) => {
  const currentPlayer = players.find(p => p.id === playerId);
  const opponent = players.find(p => p.id !== playerId);
  const isPlayer1 = players[0]?.id === playerId;

  const renderPhase = () => {
    switch (gameState.phase) {
      case 'waiting':
        return (
          <WaitingRoom
            roomId={roomId}
            players={players}
            onBack={onBack}
          />
        );
      
      case 'drafting':
        return (
          <DraftingPhase
            socket={socket}
            roomId={roomId}
            playerId={playerId}
            gameState={gameState}
            isPlayer1={isPlayer1}
            currentPlayer={currentPlayer}
            opponent={opponent}
          />
        );
      
      case 'teamBuilding':
        return (
          <TeamBuildingPhase
            socket={socket}
            roomId={roomId}
            playerId={playerId}
            gameState={gameState}
            isPlayer1={isPlayer1}
            currentPlayer={currentPlayer}
            opponent={opponent}
          />
        );
      
      case 'voting':
        return (
          <VotingPhase
            gameState={gameState}
            currentPlayer={currentPlayer}
            opponent={opponent}
          />
        );
      
      default:
        return <div>Unknown game phase</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600">
      {renderPhase()}
    </div>
  );
};

export default GameRoom;