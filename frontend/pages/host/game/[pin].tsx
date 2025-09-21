import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Users, Timer, Trophy, Settings } from 'lucide-react';
import { socketManager } from '@/lib/socket';
import { GameState, Player, Question } from '@/types/game';

export default function HostGameRoom() {
  const router = useRouter();
  const { pin } = router.query;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (!pin) return;

    // Load quiz from localStorage
    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    const quiz = savedQuizzes.find((q: any) => q.pin === pin);

    if (!quiz) {
      router.push('/host/dashboard');
      return;
    }

    const socket = socketManager.connect();

    // Create game on server with quiz data
    socket.emit('host-join-game', { pin, quiz });

    socket.on('host-joined', (data) => {
      setGameState({
        quiz: data.quiz,
        players: [],
        currentQuestionIndex: data.gameState.currentQuestionIndex,
        isActive: data.gameState.isActive,
        isPaused: data.gameState.isPaused,
        timeRemaining: 0,
        showResults: false,
        gameEnded: data.gameState.gameEnded
      });
    });

    socket.on('player-joined', (data) => {
      setPlayers(prev => [...prev.filter(p => p.id !== data.player.id), data.player]);
    });

    socket.on('player-left', (data) => {
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
    });

    socket.on('question-started', (data) => {
      setCurrentQuestion(data.question);
      setTimeRemaining(data.timeLimit);
      
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('leaderboard-updated', (data) => {
      setPlayers(data.leaderboard);
    });

    socket.on('game-ended', (data) => {
      setPlayers(data.finalLeaderboard);
      setGameState(prev => prev ? { ...prev, gameEnded: true } : null);
    });

    socket.on('game-paused', (data) => {
      setIsPaused(data.isPaused);
    });

    socket.on('error', (data) => {
      console.error('Game error:', data.message);
      alert(`Game Error: ${data.message}`);
    });

    return () => {
      socketManager.disconnect();
    };
  }, [pin]);

  const startGame = () => {
    const socket = socketManager.getSocket();
    if (socket && pin) {
      console.log('Starting game with PIN:', pin);
      socket.emit('start-game', { pin });
      setIsStarted(true);
    }
  };

  const pauseGame = () => {
    const socket = socketManager.getSocket();
    if (socket && pin) {
      socket.emit('pause-game', { pin });
    }
  };

  const endGame = () => {
    const socket = socketManager.getSocket();
    if (socket && pin) {
      socket.emit('end-game', { pin });
    }
  };

  const kickPlayer = (playerId: string) => {
    const socket = socketManager.getSocket();
    if (socket && pin) {
      socket.emit('kick-player', { pin, playerId });
    }
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Setting up game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">{gameState.quiz?.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg font-mono text-lg">
                PIN: {pin}
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Users className="h-4 w-4" />
                <span>{players.length} players</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!isStarted ? (
              <button
                onClick={startGame}
                disabled={players.length === 0}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-5 w-5" />
                <span>Start Game</span>
              </button>
            ) : (
              <>
                <button
                  onClick={pauseGame}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={endGame}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center space-x-2"
                >
                  <Square className="h-5 w-5" />
                  <span>End Game</span>
                </button>
              </>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Question */}
            {currentQuestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="game-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Question {(gameState.currentQuestionIndex || 0) + 1} of {gameState.quiz?.questions.length}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Timer className="h-5 w-5 text-blue-400" />
                    <span className={`text-2xl font-bold ${
                      timeRemaining <= 5 ? 'text-red-400 animate-pulse' : 'text-white'
                    }`}>
                      {timeRemaining}s
                    </span>
                  </div>
                </div>

                <div className={`w-full bg-gray-700 rounded-full h-3 mb-6 overflow-hidden`}>
                  <motion.div
                    className={`h-full ${
                      timeRemaining <= 5 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeRemaining / currentQuestion.timeLimit) * 100}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>

                <h3 className="text-2xl font-semibold text-white mb-4">
                  {currentQuestion.text}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg transition-all ${
                        index === currentQuestion.correctAnswer
                          ? 'bg-green-500/20 border border-green-400'
                          : 'bg-white/10 border border-white/20'
                      }`}
                    >
                      <span className="text-white">
                        <span className="font-bold">{String.fromCharCode(65 + index)}.</span> {option}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Waiting for Game Start */}
            {!isStarted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="game-card text-center"
              >
                <Play className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Ready to Start</h2>
                <p className="text-gray-300 mb-6">
                  {players.length > 0 
                    ? `${players.length} player${players.length > 1 ? 's' : ''} waiting to play`
                    : 'Waiting for players to join...'
                  }
                </p>
                {players.length > 0 && (
                  <button onClick={startGame} className="btn-primary">
                    Start Game Now
                  </button>
                )}
              </motion.div>
            )}

            {/* Game Ended */}
            {gameState.gameEnded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="game-card text-center"
              >
                <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Game Complete!</h2>
                <p className="text-gray-300">
                  Check out the final leaderboard on the right
                </p>
              </motion.div>
            )}
          </div>

          {/* Players / Leaderboard */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="game-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <span>{gameState.gameEnded ? 'Final Results' : 'Leaderboard'}</span>
                </h2>
                <span className="text-gray-300">{players.length} players</span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        index < 3 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20' 
                          : 'bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`text-lg font-bold ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                          index === 2 ? 'text-orange-400' : 'text-gray-400'
                        }`}>
                          #{index + 1}
                        </div>
                        <span className="text-white font-medium truncate">{player.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400 font-bold">{player.score}</span>
                        {!gameState.gameEnded && (
                          <button
                            onClick={() => kickPlayer(player.id)}
                            className="text-red-400 hover:text-red-300 text-xs p-1 rounded hover:bg-red-500/20 transition-all"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                {players.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No players yet</p>
                    <p className="text-sm">Share the PIN: <strong>{pin}</strong></p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}