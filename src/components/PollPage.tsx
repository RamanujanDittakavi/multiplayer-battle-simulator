import React, { useState, useEffect } from 'react';
import { Trophy, Users } from 'lucide-react';

interface Poll {
  pollId: string;
  teams: {
    player1: {
      name: string;
      team: TeamComposition;
    };
    player2: {
      name: string;
      team: TeamComposition;
    };
  };
  votes: {
    player1: number;
    player2: number;
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

interface PollPageProps {
  pollId: string;
}

const roles = [
  { key: 'captain', name: 'Captain', color: 'bg-yellow-500' },
  { key: 'viceCaptain', name: 'Vice Captain', color: 'bg-yellow-400' },
  { key: 'tank', name: 'Tank', color: 'bg-blue-500' },
  { key: 'healer', name: 'Healer', color: 'bg-green-500' },
  { key: 'support1', name: 'Support 1', color: 'bg-purple-500' },
  { key: 'support2', name: 'Support 2', color: 'bg-purple-400' }
];

// ✅ Use environment variable instead of hardcoded localhost
const API_URL = import.meta.env.VITE_BACKEND_URL;

const PollPage: React.FC<PollPageProps> = ({ pollId }) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  const fetchPoll = async () => {
    try {
      const response = await fetch(`${API_URL}/api/poll/${pollId}`);
      const data = await response.json();
      
      if (response.ok) {
        setPoll(data);
      } else {
        setError(data.error || 'Poll not found');
      }
    } catch (err) {
      setError('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const vote = async (player: 'player1' | 'player2') => {
    if (hasVoted) return;
    
    try {
      const response = await fetch(`${API_URL}/api/vote/${pollId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: player })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPoll(data);
        setHasVoted(true);
      } else {
        if (data.error === 'Already voted') {
          setHasVoted(true);
        }
        setError(data.error || 'Failed to vote');
      }
    } catch (err) {
      setError('Failed to submit vote');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  if (!poll) return null;

  const totalVotes = poll.votes.player1 + poll.votes.player2;
  const player1Percentage = totalVotes > 0 ? (poll.votes.player1 / totalVotes) * 100 : 0;
  const player2Percentage = totalVotes > 0 ? (poll.votes.player2 / totalVotes) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Naruto Team Battle</h1>
          <p className="text-gray-600 mb-4">Vote for the best team composition!</p>
          
          <div className="flex items-center justify-center space-x-4 text-gray-600">
            <Users className="w-5 h-5" />
            <span>{totalVotes} votes</span>
          </div>
        </div>

        {/* Teams Display */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Team 1 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-4 text-center">
              <h2 className="text-2xl font-bold">{poll.teams.player1.name}</h2>
              <div className="mt-2">
                <div className="text-3xl font-bold">{poll.votes.player1}</div>
                <div className="text-sm opacity-90">{player1Percentage.toFixed(1)}% votes</div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {roles.map(role => (
                  <div
                    key={role.key}
                    className={`${role.color} rounded-lg p-3 min-h-[70px] flex flex-col items-center justify-center`}
                  >
                    <h4 className="text-white font-bold text-xs mb-1">{role.name}</h4>
                    <div className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded text-xs font-medium text-center">
                      {poll.teams.player1.team[role.key as keyof TeamComposition] || 'Empty'}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => vote('player1')}
                disabled={hasVoted}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {hasVoted ? 'Voted' : 'Vote for this team'}
              </button>
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-red-600 text-white p-4 text-center">
              <h2 className="text-2xl font-bold">{poll.teams.player2.name}</h2>
              <div className="mt-2">
                <div className="text-3xl font-bold">{poll.votes.player2}</div>
                <div className="text-sm opacity-90">{player2Percentage.toFixed(1)}% votes</div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {roles.map(role => (
                  <div
                    key={role.key}
                    className={`${role.color} rounded-lg p-3 min-h-[70px] flex flex-col items-center justify-center`}
                  >
                    <h4 className="text-white font-bold text-xs mb-1">{role.name}</h4>
                    <div className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded text-xs font-medium text-center">
                      {poll.teams.player2.team[role.key as keyof TeamComposition] || 'Empty'}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => vote('player2')}
                disabled={hasVoted}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {hasVoted ? 'Voted' : 'Vote for this team'}
              </button>
            </div>
          </div>
        </div>

        {/* Vote Results Bar */}
        {totalVotes > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-center">Live Results</h3>
            <div className="flex rounded-lg overflow-hidden h-16 mb-4">
              <div 
                className="bg-blue-600 flex items-center justify-center text-white font-bold transition-all duration-500"
                style={{ width: `${player1Percentage}%` }}
              >
                {player1Percentage > 20 && `${poll.votes.player1} votes`}
              </div>
              <div 
                className="bg-red-600 flex items-center justify-center text-white font-bold transition-all duration-500"
                style={{ width: `${player2Percentage}%` }}
              >
                {player2Percentage > 20 && `${poll.votes.player2} votes`}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{poll.teams.player1.name}: {poll.votes.player1} votes</span>
              <span>{poll.teams.player2.name}: {poll.votes.player2} votes</span>
            </div>
          </div>
        )}

        {hasVoted && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mt-6 text-center">
            Thank you for voting! Results update in real-time.
          </div>
        )}
      </div>
    </div>
  );
};

export default PollPage;
