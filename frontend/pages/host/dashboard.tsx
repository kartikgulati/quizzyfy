import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Plus, Play, Users, Settings, ArrowLeft, Trash2 } from 'lucide-react';
import { socketManager } from '@/lib/socket';
import { Quiz, GameState } from '@/types/game';

export default function HostDashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeGame, setActiveGame] = useState<GameState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ quiz: Quiz | null; show: boolean }>({
    quiz: null,
    show: false
  });

  useEffect(() => {
    const socket = socketManager.connect();

    // Load saved quizzes from localStorage
    const savedQuizzes = localStorage.getItem('quizzes');
    if (savedQuizzes) {
      setQuizzes(JSON.parse(savedQuizzes));
    }

    return () => {
      socketManager.disconnect();
    };
  }, []);

  // Handle escape key to close delete dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteConfirm.show) {
        cancelDelete();
      }
    };

    if (deleteConfirm.show) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [deleteConfirm.show]);

  const createNewQuiz = () => {
    router.push('/host/create');
  };

  const startGame = (quiz: Quiz) => {
    router.push(`/host/game/${quiz.pin}`);
  };

  const goBack = () => {
    router.push('/');
  };

  const deleteQuiz = (quiz: Quiz) => {
    setDeleteConfirm({ quiz, show: true });
  };

  const confirmDelete = () => {
    if (!deleteConfirm.quiz) return;
    
    const updatedQuizzes = quizzes.filter(q => q.id !== deleteConfirm.quiz!.id);
    setQuizzes(updatedQuizzes);
    localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
    setDeleteConfirm({ quiz: null, show: false });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ quiz: null, show: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <h1 className="text-4xl font-bold text-white">Quiz Dashboard</h1>
            </div>
            <button onClick={createNewQuiz} className="btn-primary flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create New Quiz</span>
            </button>
          </div>
        </motion.div>

        {quizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="game-card max-w-md mx-auto">
              <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Quizzes Yet</h2>
              <p className="text-gray-300 mb-6">
                Create your first quiz to get started with interactive learning
              </p>
              <button onClick={createNewQuiz} className="btn-primary">
                Create Your First Quiz
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="game-card"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white truncate">{quiz.title}</h3>
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-sm font-mono">
                    {quiz.pin}
                  </span>
                </div>
                
                <div className="mb-6 text-gray-300">
                  <div className="flex items-center space-x-4 text-sm">
                    <span>{quiz.questions.length} questions</span>
                    <span>•</span>
                    <span>
                      ~{Math.ceil(quiz.questions.reduce((acc, q) => acc + q.timeLimit, 0) / 60)} min
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => startGame(quiz)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start</span>
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteQuiz(quiz)}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                    title="Delete Quiz"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && deleteConfirm.quiz && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={cancelDelete}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="game-card max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <Trash2 className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Delete Quiz</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "<strong>{deleteConfirm.quiz.title}</strong>"? 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}