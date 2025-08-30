import React, { useState } from 'react';
import { Users, Lock, Play } from 'lucide-react';

interface HomePageProps {
  onJoinGame: (roomId: string, playerId: string) => void;
}

// ✅ Use environment variable for backend URL
const API_URL = import.meta.env.VITE_BACKEND_URL;

const HomePage: React.FC<HomePageProps> = ({ onJoinGame }) => {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [formData, setFormData] = useState({
    playerName: '',
    password: '',
    roomId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!formData.playerName || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: formData.playerName,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        onJoinGame(data.roomId, data.playerId);
      } else {
        setError(data.error || 'Failed to create room');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!formData.playerName || !formData.password || !formData.roomId) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/join-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: formData.roomId.toUpperCase(),
          playerName: formData.playerName,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        onJoinGame(data.roomId, data.playerId);
      } else {
        setError(data.error || 'Failed to join room');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform hover:scale-105 transition-transform duration-300">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Naruto</h1>
          <h2 className="text-2xl font-semibold text-orange-600 mb-4">Team Builder</h2>
          <p className="text-gray-600">Create your ultimate ninja team!</p>
        </div>

        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>Create Room</span>
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Join Room</span>
            </button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.playerName}
              onChange={(e) => setFormData(prev => ({ ...prev, playerName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            {mode === 'join' && (
              <input
                type="text"
                placeholder="Room ID"
                value={formData.roomId}
                onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                maxLength={6}
              />
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Room Password (digits only)"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value.replace(/\D/g, '') }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                maxLength={8}
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setMode('menu')}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Back
              </button>
              
              <button
                onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
                disabled={loading}
                className={`flex-1 ${mode === 'create' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50`}
              >
                {loading ? 'Loading...' : (mode === 'create' ? 'Create' : 'Join')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
