import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Users, Gamepad2, Trophy, Zap } from 'lucide-react';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [gamePin, setGamePin] = useState('');
  const router = useRouter();

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && gamePin.trim()) {
      router.push(`/game/${gamePin}?name=${encodeURIComponent(playerName)}`);
    }
  };

  const createGame = () => {
    router.push('/host/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Zap className="h-12 w-12 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Quizzzyfy</h1>
          <p className="text-xl text-gray-300 mb-8">
            A free Real-time interactive quiz platform for everyone
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Join Game */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="game-card"
          >
            <div className="text-center mb-6">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Join Game</h2>
              <p className="text-gray-300">Enter a game PIN to join the fun</p>
            </div>

            <form onSubmit={joinGame} className="space-y-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                maxLength={20}
                required
              />
              <input
                type="text"
                placeholder="Game PIN"
                value={gamePin}
                onChange={(e) => setGamePin(e.target.value.toUpperCase())}
                className="w-full p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-center text-xl font-mono"
                maxLength={6}
                required
              />
              <button type="submit" className="w-full btn-primary">
                Join Game
              </button>
            </form>
          </motion.div>

          {/* Host Game */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="game-card"
          >
            <div className="text-center mb-6">
              <Gamepad2 className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Host Game</h2>
              <p className="text-gray-300">Create and manage your own quiz</p>
            </div>

            <div className="space-y-6">
              <div className="text-center text-gray-300 space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span>Live leaderboards</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  <span>Real-time scoring</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>Player management</span>
                </div>
              </div>

              <button onClick={createGame} className="w-full btn-primary">
                Create Quiz
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12 text-gray-400"
        >
          <p>No account required • Join instantly with just a PIN</p>
        </motion.div>
      </div>
    </div>
  );
}