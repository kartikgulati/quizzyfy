import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Users, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { socketManager } from '@/lib/socket';
import { Question, Player, GameState } from '@/types/game';

export default function GameRoom() {
  const router = useRouter();
  const { pin, name } = router.query;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean;
    correctAnswer: number;
  } | null>(null);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);

  useEffect(() => {
    if (!pin || !name) return;

    const socket = socketManager.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-game', { pin, playerName: name });
    });

    socket.on('player-joined', (data) => {
      console.log('Player joined:', data);
    });

    socket.on('game-started', (data) => {
      setGameState(data);
      console.log('Game started:', data);
    });

    socket.on('question-started', (data) => {
      setCurrentQuestion(data.question);
      setTimeRemaining(data.timeLimit);
      setSelectedAnswer(null);
      setUserAnswer(null);
      setHasAnswered(false);
      setShowResults(false);
      setLastAnswerResult(null);

      // Start countdown
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('question-ended', (data) => {
      console.log('Question ended - userAnswer:', userAnswer, 'correctAnswer:', data.correctAnswer);
      setShowResults(true);
      setLastAnswerResult({
        isCorrect: userAnswer === data.correctAnswer,
        correctAnswer: data.correctAnswer,
      });
    });

    socket.on('leaderboard-updated', (data) => {
      setGameState(prev => prev ? { ...prev, players: data.leaderboard } : null);
    });

    socket.on('game-ended', (data) => {
      setGameState(prev => prev ? { ...prev, gameEnded: true, players: data.finalLeaderboard } : null);
    });

    socket.on('error', (data) => {
      setError(data.message);
    });

    return () => {
      socketManager.disconnect();
    };
  }, [pin, name]);

  const submitAnswer = (answerIndex: number) => {
    if (hasAnswered || !currentQuestion) return;

    console.log('Submitting answer:', answerIndex, 'for question:', currentQuestion.id);
    setSelectedAnswer(answerIndex);
    setUserAnswer(answerIndex);
    setHasAnswered(true);

    const socket = socketManager.getSocket();
    if (socket) {
      socket.emit('submit-answer', {
        questionId: currentQuestion.id,
        answerIndex,
        timeToAnswer: currentQuestion.timeLimit - timeRemaining,
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
        <div className="game-card max-w-md text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Game Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to game...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion && !gameState?.gameEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="game-card max-w-md text-center"
        >
          <Users className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Waiting for Game</h2>
          <p className="text-gray-300 mb-6">
            You've joined the game! Waiting for the host to start...
          </p>
          <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg font-mono text-xl">
            PIN: {pin}
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameState?.gameEnded) {
    const sortedPlayers = [...(gameState.players || [])].sort((a, b) => b.score - a.score);
    const playerPosition = sortedPlayers.findIndex(p => p.name === name) + 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 p-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Game Over!</h1>
            <p className="text-xl text-gray-300">
              You finished #{playerPosition} out of {sortedPlayers.length} players
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {sortedPlayers.slice(0, 10).map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`leaderboard-item flex items-center justify-between ${
                  player.name === name ? 'ring-2 ring-yellow-400' : ''
                } ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-orange-400' : 'text-gray-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <span className="text-white font-semibold">{player.name}</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {player.score}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Play Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Timer and Question Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center space-x-2 text-white">
              <Timer className="h-5 w-5 text-blue-400" />
              <span className={`text-2xl font-bold ${
                timeRemaining <= 5 ? 'text-red-400 animate-pulse' : 'text-white'
              }`}>
                {timeRemaining}s
              </span>
            </div>
          </div>
          <div className={`w-full bg-gray-700 rounded-full h-2 mb-4 overflow-hidden`}>
            <motion.div
              className={`h-full ${
                timeRemaining <= 5 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeRemaining / (currentQuestion?.timeLimit || 30)) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </motion.div>

        {/* Question */}
        {currentQuestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="game-card mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {currentQuestion.text}
            </h2>
          </motion.div>
        )}

        {/* Answer Options */}
        <AnimatePresence>
          {currentQuestion && !showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => submitAnswer(index)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-xl text-left font-semibold transition-all transform ${
                    selectedAnswer === index
                      ? 'bg-blue-500 text-white scale-105 shadow-lg'
                      : hasAnswered
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:scale-105 border border-white/30'
                  }`}
                >
                  <span className="text-lg">{String.fromCharCode(65 + index)}.</span> {option}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Results */}
          {showResults && lastAnswerResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className={`game-card ${
                lastAnswerResult.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {lastAnswerResult.isCorrect ? (
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                )}
                <h3 className={`text-2xl font-bold mb-2 ${
                  lastAnswerResult.isCorrect ? 'text-green-400' : 'text-red-400'
                }`}>
                  {lastAnswerResult.isCorrect ? 'Correct!' : 'Incorrect!'}
                </h3>
                <p className="text-gray-300 mb-4">
                  The correct answer was: {currentQuestion?.options[lastAnswerResult.correctAnswer]}
                </p>
                <p className="text-sm text-gray-400">
                  Waiting for next question...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}