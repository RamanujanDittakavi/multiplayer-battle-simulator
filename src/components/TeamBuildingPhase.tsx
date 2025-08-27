import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

interface Player {
  id: string;
  name: string;
  connected: boolean;
}

interface GameState {
  phase: string;
  selectedCharacters: {
    player1: string[];
    player2: string[];
  };
  teams: {
    player1: TeamComposition;
    player2: TeamComposition;
  };
}

interface TeamComposition {
  captain?: string;
  viceCaptain?: string;
  tank?: string;
  healer?: string;
  support1?: string;
  support2?: string;
}

interface TeamBuildingPhaseProps {
  socket: Socket | null;
  roomId: string;
  playerId: string;
  gameState: GameState;
  isPlayer1: boolean;
  currentPlayer?: Player;
  opponent?: Player;
}

const roles = [
  { key: 'captain', name: 'Captain', color: 'bg-yellow-500' },
  { key: 'viceCaptain', name: 'Vice Captain', color: 'bg-yellow-400' },
  { key: 'tank', name: 'Tank', color: 'bg-blue-500' },
  { key: 'healer', name: 'Healer', color: 'bg-green-500' },
  { key: 'support1', name: 'Support 1', color: 'bg-purple-500' },
  { key: 'support2', name: 'Support 2', color: 'bg-purple-400' }
];

const TeamBuildingPhase: React.FC<TeamBuildingPhaseProps> = ({
  socket,
  roomId,
  playerId,
  gameState,
  isPlayer1,
  currentPlayer,
  opponent
}) => {
  const myCharacters = isPlayer1 ? gameState.selectedCharacters.player1 : gameState.selectedCharacters.player2;
  const myTeam = isPlayer1 ? gameState.teams.player1 : gameState.teams.player2;
  const opponentTeam = isPlayer1 ? gameState.teams.player2 : gameState.teams.player1;
  
  const [selectedTeam, setSelectedTeam] = useState<TeamComposition>(myTeam || {});
  const [draggedCharacter, setDraggedCharacter] = useState<string | null>(null);

  const assignCharacter = (role: string, character: string) => {
    const newTeam = { ...selectedTeam, [role]: character };
    setSelectedTeam(newTeam);
    
    if (socket) {
      socket.emit('update-team', {
        roomId,
        playerId,
        team: newTeam
      });
    }
  };

  const removeFromRole = (role: string) => {
    const newTeam = { ...selectedTeam };
    delete newTeam[role as keyof TeamComposition];
    setSelectedTeam(newTeam);
    
    if (socket) {
      socket.emit('update-team', {
        roomId,
        playerId,
        team: newTeam
      });
    }
  };

  const getAvailableCharacters = () => {
    const usedCharacters = Object.values(selectedTeam).filter(Boolean);
    return myCharacters.filter(char => !usedCharacters.includes(char));
  };

  const isTeamComplete = () => {
    return roles.every(role => selectedTeam[role.key as keyof TeamComposition]);
  };

  const finalizeTeams = () => {
    if (socket && isTeamComplete()) {
      socket.emit('finalize-teams', { roomId });
    }
  };

  const handleDragStart = (character: string) => {
    setDraggedCharacter(character);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, role: string) => {
    e.preventDefault();
    if (draggedCharacter) {
      assignCharacter(role, draggedCharacter);
      setDraggedCharacter(null);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Team Building</h2>
              <p className="text-gray-600">Arrange your characters into roles</p>
            </div>
            <button
              onClick={finalizeTeams}
              disabled={!isTeamComplete()}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Finalize Teams
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Your Team Building */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-blue-600">
                {currentPlayer?.name || 'Your'} Team
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {roles.map(role => (
                  <div
                    key={role.key}
                    className={`${role.color} rounded-lg p-4 min-h-[80px] flex flex-col items-center justify-center`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, role.key)}
                  >
                    <h4 className="text-white font-bold text-sm mb-2">{role.name}</h4>
                    {selectedTeam[role.key as keyof TeamComposition] ? (
                      <div
                        className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded text-sm font-medium cursor-pointer"
                        onClick={() => removeFromRole(role.key)}
                      >
                        {selectedTeam[role.key as keyof TeamComposition]}
                      </div>
                    ) : (
                      <div className="text-white text-xs opacity-75">Drop here</div>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-bold mb-3">Available Characters</h4>
                <div className="grid grid-cols-3 gap-2">
                  {getAvailableCharacters().map(character => (
                    <div
                      key={character}
                      draggable
                      onDragStart={() => handleDragStart(character)}
                      className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded text-sm font-medium cursor-move transition-colors"
                    >
                      {character}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Opponent Team Display */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-red-600">
              {opponent?.name || 'Opponent'} Team
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {roles.map(role => (
                <div
                  key={role.key}
                  className={`${role.color} rounded-lg p-4 min-h-[80px] flex flex-col items-center justify-center`}
                >
                  <h4 className="text-white font-bold text-sm mb-2">{role.name}</h4>
                  {opponentTeam[role.key as keyof TeamComposition] ? (
                    <div className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded text-sm font-medium">
                      {opponentTeam[role.key as keyof TeamComposition]}
                    </div>
                  ) : (
                    <div className="text-white text-xs opacity-75">Empty</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBuildingPhase;