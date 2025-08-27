import React from 'react';
import { Copy, Users, ArrowLeft } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  connected: boolean;
}

interface WaitingRoomProps {
  roomId: string;
  players: Player[];
  onBack: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomId, players, onBack }) => {
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Waiting Room</h2>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Room ID</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl font-mono font-bold text-orange-600">{roomId}</span>
              <button
                onClick={copyRoomId}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy Room ID"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-2 text-gray-700 mb-4">
            <Users className="w-5 h-5" />
            <span className="font-semibold">Players ({players.length}/2)</span>
          </div>
          
          {players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${player.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">{player.name}</span>
                <span className="text-sm text-gray-500">Player {index + 1}</span>
              </div>
              <span className="text-xs text-gray-500">
                {player.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          ))}
          
          {players.length < 2 && (
            <div className="text-center p-8 text-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Waiting for another player to join...</p>
            </div>
          )}
        </div>

        <button
          onClick={onBack}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Menu</span>
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;