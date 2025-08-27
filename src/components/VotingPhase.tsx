import React from 'react';
import { ExternalLink, Trophy } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  connected: boolean;
}

interface GameState {
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

interface VotingPhaseProps {
  gameState: GameState;
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

const VotingPhase: React.FC<VotingPhaseProps> = ({
  gameState,
  currentPlayer,
  opponent
}) => {
  const pollUrl = `${window.location.origin}/poll/${gameState.pollId}`;

  const openPoll = () => {
    window.open(pollUrl, '_blank');
  };

  const copyPollUrl = () => {
    navigator.clipboard.writeText(pollUrl);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Teams Are Ready!</h2>
          <p className="text-gray-600 mb-4">Share the poll with others to vote for the best team</p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={openPoll}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Poll</span>
            </button>
            
            <button
              onClick={copyPollUrl}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Copy Poll URL
            </button>
          </div>
        </div>

        {/* Final Teams Display */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Team 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-6 text-blue-600 text-center">
              {currentPlayer?.name || 'Player 1'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {roles.map(role => (
                <div
                  key={role.key}
                  className={`${role.color} rounded-lg p-4 min-h-[80px] flex flex-col items-center justify-center`}
                >
                  <h4 className="text-white font-bold text-sm mb-2">{role.name}</h4>
                  <div className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded text-sm font-medium text-center">
                    {gameState.teams.player1[role.key as keyof TeamComposition] || 'Empty'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold mb-6 text-red-600 text-center">
              {opponent?.name || 'Player 2'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {roles.map(role => (
                <div
                  key={role.key}
                  className={`${role.color} rounded-lg p-4 min-h-[80px] flex flex-col items-center justify-center`}
                >
                  <h4 className="text-white font-bold text-sm mb-2">{role.name}</h4>
                  <div className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded text-sm font-medium text-center">
                    {gameState.teams.player2[role.key as keyof TeamComposition] || 'Empty'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Poll URL Display */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-lg font-bold mb-4">Share this poll:</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <code className="text-sm break-all">{pollUrl}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingPhase;