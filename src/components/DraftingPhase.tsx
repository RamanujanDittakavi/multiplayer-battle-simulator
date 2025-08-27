import React from 'react';
import { Socket } from 'socket.io-client';

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
    player1: any;
    player2: any;
  };
}

interface DraftingPhaseProps {
  socket: Socket | null;
  roomId: string;
  playerId: string;
  gameState: GameState;
  isPlayer1: boolean;
  currentPlayer?: Player;
  opponent?: Player;
}

const DraftingPhase: React.FC<DraftingPhaseProps> = ({
  socket,
  roomId,
  playerId,
  gameState,
  isPlayer1,
  currentPlayer,
  opponent
}) => {
  const currentTurnPlayer = gameState.currentTurn % 2;
  const isMyTurn = (isPlayer1 && currentTurnPlayer === 0) || (!isPlayer1 && currentTurnPlayer === 1);
  const myCharacters = isPlayer1 ? gameState.selectedCharacters.player1 : gameState.selectedCharacters.player2;
  const opponentCharacters = isPlayer1 ? gameState.selectedCharacters.player2 : gameState.selectedCharacters.player1;

  const selectCharacter = (index: number) => {
    if (isMyTurn && socket && gameState.shuffledCharacters[index]) {
      socket.emit('select-character', {
        roomId,
        playerId,
        characterIndex: index
      });
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Character Draft</h2>
              <p className="text-gray-600">Pick {12 - myCharacters.length} more characters</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {isMyTurn ? 'Your Turn' : `${opponent?.name || 'Opponent'}'s Turn`}
              </p>
              <p className="text-sm text-gray-600">Turn {gameState.currentTurn + 1} / 24</p>
            </div>
          </div>
        </div>

        {/* Player Teams */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-blue-600">
              {currentPlayer?.name || 'You'} ({myCharacters.length}/12)
            </h3>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {myCharacters.map((character, index) => (
                <div
                  key={index}
                  className="bg-blue-100 p-2 rounded text-center text-sm font-medium text-blue-800"
                >
                  {character}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              {opponent?.name || 'Opponent'} ({opponentCharacters.length}/12)
            </h3>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {opponentCharacters.map((character, index) => (
                <div
                  key={index}
                  className="bg-red-100 p-2 rounded text-center text-sm font-medium text-red-800"
                >
                  {character}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Characters */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Available Characters</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {gameState.shuffledCharacters.map((character, index) => (
              <button
                key={index}
                onClick={() => selectCharacter(index)}
                disabled={!character || !isMyTurn}
                className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !character 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isMyTurn
                      ? 'bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                {character || 'Selected'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftingPhase;