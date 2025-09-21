const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://127.0.0.1:3000",
      "https://*.vercel.app",
      "https://*.railway.app",
      "https://*.render.com",
      "https://*.herokuapp.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage for games
const games = new Map();
const playerSockets = new Map();

// Sample quiz data
const sampleQuizzes = [
  {
    id: 'sample1',
    title: 'General Knowledge Quiz',
    pin: 'DEMO01',
    questions: [
      {
        id: 'q1',
        text: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        timeLimit: 20
      },
      {
        id: 'q2',
        text: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 1,
        timeLimit: 15
      },
      {
        id: 'q3',
        text: 'What is 7 x 8?',
        options: ['54', '56', '58', '52'],
        correctAnswer: 1,
        timeLimit: 10
      }
    ]
  }
];

// Initialize sample games
sampleQuizzes.forEach(quiz => {
  games.set(quiz.pin, {
    quiz,
    players: new Map(),
    currentQuestionIndex: -1,
    isActive: false,
    isPaused: false,
    timeRemaining: 0,
    showResults: false,
    gameEnded: false,
    questionStartTime: null,
    hostSocket: null
  });
});

function generatePin() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function calculateScore(isCorrect, timeToAnswer, timeLimit) {
  if (!isCorrect) return 0;
  
  const baseScore = 1000;
  const speedBonus = Math.max(0, Math.floor((timeLimit - timeToAnswer) / timeLimit * 500));
  return baseScore + speedBonus;
}

function getLeaderboard(gamePin) {
  const game = games.get(gamePin);
  if (!game) return [];
  
  return Array.from(game.players.values()).sort((a, b) => b.score - a.score);
}

// Socket.IO connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Host creates a new game
  socket.on('create-game', (data) => {
    const { quiz } = data;
    const pin = generatePin();
    
    const gameData = {
      quiz: { ...quiz, pin },
      players: new Map(),
      currentQuestionIndex: -1,
      isActive: false,
      isPaused: false,
      timeRemaining: 0,
      showResults: false,
      gameEnded: false,
      questionStartTime: null,
      hostSocket: socket.id
    };
    
    games.set(pin, gameData);
    socket.join(`game-${pin}`);
    socket.join(`host-${pin}`);
    
    socket.emit('game-created', { pin, quiz: gameData.quiz });
    console.log(`Game created with PIN: ${pin}`);
  });

  // Host joins existing game or creates new one
  socket.on('host-join-game', (data) => {
    const { pin, quiz } = data;
    let game = games.get(pin);
    
    if (!game) {
      // Create new game if it doesn't exist
      if (!quiz) {
        socket.emit('error', { message: 'Quiz data required to create game.' });
        return;
      }
      
      game = {
        quiz: { ...quiz, pin },
        players: new Map(),
        currentQuestionIndex: -1,
        isActive: false,
        isPaused: false,
        timeRemaining: 0,
        showResults: false,
        gameEnded: false,
        questionStartTime: null,
        hostSocket: socket.id
      };
      
      games.set(pin, game);
      console.log(`Created new game with PIN: ${pin}`);
    } else {
      // Update host socket for existing game
      game.hostSocket = socket.id;
    }
    
    socket.join(`game-${pin}`);
    socket.join(`host-${pin}`);
    
    socket.emit('host-joined', { 
      quiz: game.quiz,
      gameState: {
        isActive: game.isActive,
        currentQuestionIndex: game.currentQuestionIndex,
        isPaused: game.isPaused,
        gameEnded: game.gameEnded
      }
    });
    
    console.log(`Host joined game ${pin}`);
  });

  // Host starts the game
  socket.on('start-game', (data) => {
    const { pin } = data;
    const game = games.get(pin);
    
    if (!game || game.hostSocket !== socket.id) {
      socket.emit('error', { message: 'Game not found or unauthorized' });
      return;
    }
    
    game.isActive = true;
    game.currentQuestionIndex = 0;
    
    const gameState = {
      quiz: game.quiz,
      players: Array.from(game.players.values()),
      currentQuestionIndex: game.currentQuestionIndex,
      isActive: game.isActive,
      isPaused: game.isPaused,
      timeRemaining: 0,
      showResults: false,
      gameEnded: game.gameEnded
    };
    
    io.to(`game-${pin}`).emit('game-started', gameState);
    
    // Start first question after a brief delay
    setTimeout(() => {
      startQuestion(pin);
    }, 3000);
  });

  // Player joins game
  socket.on('join-game', (data) => {
    const { pin, playerName } = data;
    const game = games.get(pin);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found. Please check the PIN.' });
      return;
    }
    
    if (game.gameEnded) {
      socket.emit('error', { message: 'This game has already ended.' });
      return;
    }
    
    // Check if player already exists
    const existingPlayer = Array.from(game.players.values()).find(p => p.name === playerName);
    if (existingPlayer) {
      socket.emit('error', { message: 'Player name already taken.' });
      return;
    }
    
    const player = {
      id: socket.id,
      name: playerName,
      score: 0,
      currentAnswerTime: null
    };
    
    game.players.set(socket.id, player);
    playerSockets.set(socket.id, { pin, playerName });
    
    socket.join(`game-${pin}`);
    
    socket.emit('joined-game', { 
      player,
      gameState: {
        isActive: game.isActive,
        currentQuestionIndex: game.currentQuestionIndex,
        isPaused: game.isPaused
      }
    });
    
    io.to(`game-${pin}`).emit('player-joined', { 
      player, 
      totalPlayers: game.players.size 
    });
    
    console.log(`Player ${playerName} joined game ${pin}`);
  });

  // Player submits answer
  socket.on('submit-answer', (data) => {
    const playerData = playerSockets.get(socket.id);
    if (!playerData) return;
    
    const { pin } = playerData;
    const { questionId, answerIndex, timeToAnswer } = data;
    const game = games.get(pin);
    
    if (!game || !game.isActive || game.showResults) return;
    
    const player = game.players.get(socket.id);
    if (!player || player.currentAnswerTime !== null) return; // Already answered
    
    const currentQuestion = game.quiz.questions[game.currentQuestionIndex];
    if (!currentQuestion || currentQuestion.id !== questionId) return;
    
    player.currentAnswerTime = timeToAnswer;
    player.lastAnswer = answerIndex;
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const points = calculateScore(isCorrect, timeToAnswer, currentQuestion.timeLimit);
    
    console.log(`Answer check - Player: ${player.name}, AnswerIndex: ${answerIndex}, CorrectAnswer: ${currentQuestion.correctAnswer}, IsCorrect: ${isCorrect}`);
    
    if (isCorrect) {
      player.score += points;
    }
    
    console.log(`Player ${player.name} answered question ${questionId}: ${isCorrect ? 'correct' : 'incorrect'} (+${points} points)`);
    
    // Check if all players have answered
    const allAnswered = Array.from(game.players.values()).every(p => p.currentAnswerTime !== null);
    if (allAnswered) {
      endQuestion(pin);
    }
  });

  // Host controls
  socket.on('pause-game', (data) => {
    const { pin } = data;
    const game = games.get(pin);
    
    if (!game || game.hostSocket !== socket.id) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }
    
    game.isPaused = !game.isPaused;
    io.to(`game-${pin}`).emit('game-paused', { isPaused: game.isPaused });
  });

  socket.on('end-game', (data) => {
    const { pin } = data;
    const game = games.get(pin);
    
    if (!game || game.hostSocket !== socket.id) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }
    
    endGame(pin);
  });

  socket.on('kick-player', (data) => {
    const { pin, playerId } = data;
    const game = games.get(pin);
    
    if (!game || game.hostSocket !== socket.id) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }
    
    game.players.delete(playerId);
    playerSockets.delete(playerId);
    
    io.to(playerId).emit('kicked-from-game', { message: 'You have been removed from the game' });
    io.to(`game-${pin}`).emit('player-left', { playerId, totalPlayers: game.players.size });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    const playerData = playerSockets.get(socket.id);
    if (playerData) {
      const { pin } = playerData;
      const game = games.get(pin);
      
      if (game) {
        game.players.delete(socket.id);
        io.to(`game-${pin}`).emit('player-left', { 
          playerId: socket.id, 
          totalPlayers: game.players.size 
        });
      }
      
      playerSockets.delete(socket.id);
    }
    
    // Check if disconnected socket was a host
    for (const [pin, game] of games.entries()) {
      if (game.hostSocket === socket.id) {
        game.hostSocket = null;
        // Game continues but no host controls
      }
    }
  });
});

function startQuestion(pin) {
  const game = games.get(pin);
  if (!game || game.isPaused || game.gameEnded) return;
  
  const question = game.quiz.questions[game.currentQuestionIndex];
  if (!question) {
    endGame(pin);
    return;
  }
  
  // Reset player answer times
  game.players.forEach(player => {
    player.currentAnswerTime = null;
  });
  
  game.questionStartTime = Date.now();
  game.timeRemaining = question.timeLimit;
  game.showResults = false;
  
  io.to(`game-${pin}`).emit('question-started', {
    question,
    questionIndex: game.currentQuestionIndex,
    timeLimit: question.timeLimit
  });
  
  console.log(`Started question ${game.currentQuestionIndex + 1} for game ${pin}`);
  
  // Set timer for question end
  setTimeout(() => {
    if (games.has(pin) && !game.showResults) {
      endQuestion(pin);
    }
  }, question.timeLimit * 1000);
}

function endQuestion(pin) {
  const game = games.get(pin);
  if (!game || game.showResults) return;
  
  game.showResults = true;
  const question = game.quiz.questions[game.currentQuestionIndex];
  
  const results = Array.from(game.players.values()).map(player => ({
    playerId: player.id,
    playerName: player.name,
    isCorrect: player.currentAnswerTime !== null && 
               question.correctAnswer === player.lastAnswer,
    timeToAnswer: player.currentAnswerTime || question.timeLimit,
    pointsEarned: player.score
  }));
  
  console.log(`Sending question-ended event - correctAnswer: ${question.correctAnswer}`);
  console.log(`Question data:`, question);
  console.log(`Results:`, results);
  io.to(`game-${pin}`).emit('question-ended', {
    correctAnswer: question.correctAnswer,
    results
  });
  
  // Send updated leaderboard
  const leaderboard = getLeaderboard(pin);
  io.to(`game-${pin}`).emit('leaderboard-updated', { leaderboard });
  
  console.log(`Question ${game.currentQuestionIndex + 1} ended for game ${pin}`);
  
  // Move to next question after showing results
  setTimeout(() => {
    game.currentQuestionIndex++;
    if (game.currentQuestionIndex < game.quiz.questions.length) {
      startQuestion(pin);
    } else {
      endGame(pin);
    }
  }, 5000); // Show results for 5 seconds
}

function endGame(pin) {
  const game = games.get(pin);
  if (!game) return;
  
  game.gameEnded = true;
  game.isActive = false;
  
  const finalLeaderboard = getLeaderboard(pin);
  
  io.to(`game-${pin}`).emit('game-ended', {
    finalLeaderboard
  });
  
  console.log(`Game ${pin} ended`);
  
  // Clean up game after some time
  setTimeout(() => {
    games.delete(pin);
    console.log(`Game ${pin} cleaned up`);
  }, 30000); // Keep game data for 30 seconds after end
}

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', games: games.size });
});

app.get('/api/games', (req, res) => {
  const gamesList = Array.from(games.entries()).map(([pin, game]) => ({
    pin,
    title: game.quiz.title,
    players: game.players.size,
    isActive: game.isActive,
    currentQuestion: game.currentQuestionIndex + 1,
    totalQuestions: game.quiz.questions.length
  }));
  
  res.json(gamesList);
});

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Sample game available with PIN: ${sampleQuizzes[0].pin}`);
  console.log(`CORS enabled for: ${NODE_ENV === 'production' ? 'production domains' : 'localhost'}`);
});