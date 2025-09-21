import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { Question, Quiz } from '@/types/game';

export default function CreateQuiz() {
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([
    {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      timeLimit: 30,
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        timeLimit: 30,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const generatePin = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const saveQuiz = () => {
    if (!quizTitle.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    const invalidQuestions = questions.some(
      (q) => !q.text.trim() || q.options.some((opt) => !opt.trim())
    );

    if (invalidQuestions) {
      alert('Please fill in all question texts and options');
      return;
    }

    const quiz: Quiz = {
      id: Date.now().toString(),
      title: quizTitle,
      pin: generatePin(),
      questions: questions.map((q, index) => ({
        ...q,
        id: `q${index + 1}`,
      })),
    };

    // Save to localStorage
    const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    const updatedQuizzes = [...existingQuizzes, quiz];
    localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));

    router.push('/host/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/host/dashboard')}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <h1 className="text-4xl font-bold text-white">Create Quiz</h1>
            </div>
            <button onClick={saveQuiz} className="btn-primary flex items-center space-x-2">
              <Save className="h-5 w-5" />
              <span>Save Quiz</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Quiz Title */}
          <div className="game-card">
            <h2 className="text-xl font-bold text-white mb-4">Quiz Details</h2>
            <input
              type="text"
              placeholder="Enter quiz title..."
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all text-xl font-semibold"
              maxLength={50}
            />
          </div>

          {/* Questions */}
          {questions.map((question, questionIndex) => (
            <motion.div
              key={questionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * questionIndex }}
              className="game-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  Question {questionIndex + 1}
                </h3>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Question Text
                  </label>
                  <textarea
                    placeholder="Enter your question..."
                    value={question.text}
                    onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Answer Options
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="relative">
                        <input
                          type="text"
                          placeholder={`Option ${optionIndex + 1}...`}
                          value={option}
                          onChange={(e) =>
                            updateOption(questionIndex, optionIndex, e.target.value)
                          }
                          className={`w-full p-3 rounded-lg border transition-all ${
                            question.correctAnswer === optionIndex
                              ? 'bg-green-500/20 border-green-400 text-white'
                              : 'bg-white/20 backdrop-blur-sm border-white/30 text-white'
                          } placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(questionIndex, 'correctAnswer', optionIndex)
                          }
                          className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full transition-all ${
                            question.correctAnswer === optionIndex
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-500 text-gray-300 hover:bg-gray-400'
                          } text-xs font-bold`}
                        >
                          ✓
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Click the checkmark to set the correct answer
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time Limit (seconds)
                  </label>
                  <select
                    value={question.timeLimit}
                    onChange={(e) =>
                      updateQuestion(questionIndex, 'timeLimit', parseInt(e.target.value))
                    }
                    className="w-32 p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                  >
                    <option value={15}>15s</option>
                    <option value={20}>20s</option>
                    <option value={30}>30s</option>
                    <option value={45}>45s</option>
                    <option value={60}>60s</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add Question Button */}
          <motion.button
            onClick={addQuestion}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full game-card flex items-center justify-center space-x-2 text-gray-300 hover:text-white border-2 border-dashed border-gray-500 hover:border-gray-400 transition-all"
          >
            <Plus className="h-6 w-6" />
            <span>Add Another Question</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}