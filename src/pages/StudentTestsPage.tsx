import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, ClipboardCheck, Sparkles, BookOpen, AlertCircle, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { api } from "../api";
import { Test, Result } from "../types";
import ScoreRing from "../components/ScoreRing";

interface StudentTestsPageProps {
  studentId: string;
}

export default function StudentTestsPage({ studentId }: StudentTestsPageProps) {
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Testing Active State
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionText: string]: string }>({});
  
  // Test Completion Screen State
  const [finishedResult, setFinishedResult] = useState<Result | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTests, studentAttempts] = await Promise.all([
        api.getTests(),
        api.getResultsByStudent(studentId)
      ]);
      setTests(allTests);
      setAttempts(studentAttempts);
      setError("");
    } catch (err: any) {
      setError(err.message || "Помилка завантаження тестів");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleStartTest = (test: Test) => {
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setFinishedResult(null);
  };

  const handleSelectOption = (option: string) => {
    if (!activeTest) return;
    const currentQuestion = activeTest.questions[currentQuestionIndex];
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.questionText]: option
    });
  };

  const handleNext = () => {
    if (!activeTest) return;
    if (currentQuestionIndex < activeTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;

    // Check if all questions are answered, warn if not
    const unansweredCount = activeTest.questions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`Ви відповіли не на всі запитання (залишилось: ${unansweredCount}). Дійсно завершити тест?`)) {
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        test: activeTest.id,
        answers: activeTest.questions.map(q => ({
          questionText: q.questionText,
          selectedAnswer: selectedAnswers[q.questionText] || ""
        }))
      };

      const result = await api.createResult(payload);
      setFinishedResult(result);
      
      // Calculate percentage to trigger confetti on pass
      const pct = result.score / (result.test?.maxScore || result.score || 1);
      if (pct >= 0.6) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      setActiveTest(null);
      loadData();
    } catch (err: any) {
      alert(err.message || "Помилка завершення тесту");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get matching attempt score for a test
  const getTestAttemptInfo = (testId: string) => {
    const matched = attempts.filter(a => a.testId === testId);
    if (matched.length === 0) return null;
    // return highest or latest score
    const latest = matched[matched.length - 1];
    return latest;
  };

  if (activeTest) {
    const currentQuestion = activeTest.questions[currentQuestionIndex];
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === activeTest.questions.length - 1;
    const currentSelection = selectedAnswers[currentQuestion.questionText] || "";
    const progressPercent = Math.round(((currentQuestionIndex + 1) / activeTest.questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto py-4">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Проходження тесту
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 font-display mt-0.5">
              {activeTest.title}
            </h2>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Дійсно скасувати тест? Ваші поточні відповіді не збережуться.")) {
                setActiveTest(null);
              }
            }}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            Вийти
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-100 rounded-full h-2 overflow-hidden mb-6">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Dynamic Question Container with motion fade-in */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-slate-100 shadow-lg rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between text-xs font-bold font-mono text-slate-400">
              <span>Питання {currentQuestionIndex + 1} з {activeTest.questions.length}</span>
              <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{progressPercent}% виконано</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display leading-snug">
              {currentQuestion.questionText}
            </h3>

            {/* Options grid */}
            <div className="grid grid-cols-1 gap-3.5 pt-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = currentSelection === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between group ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm"
                        : "bg-slate-50/50 border-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 bg-white group-hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav Controls */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={isFirstQuestion}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 disabled:opacity-30 disabled:pointer-events-none hover:text-slate-800 transition-colors px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>

          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              disabled={!currentSelection}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-indigo-100"
            >
              Наступне
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitTest}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-100"
            >
              Завершити тест
            </button>
          )}
        </div>
      </div>
    );
  }

  // Result display card
  if (finishedResult) {
    const passed = finishedResult.score / (finishedResult.test?.maxScore || finishedResult.score || 1) >= 0.6;

    return (
      <div className="max-w-md mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-100 shadow-xl rounded-2xl p-6 text-center space-y-6"
        >
          <div className="inline-flex p-4 rounded-full bg-slate-50">
            <Sparkles className={`w-12 h-12 ${passed ? "text-emerald-500 animate-bounce" : "text-rose-500 animate-pulse"}`} />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900 font-display">Тест завершено!</h3>
            <p className="text-slate-400 text-xs mt-1">Оцінка розрахована автоматично на сервері</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center gap-4">
            <ScoreRing
              score={finishedResult.score}
              maxScore={finishedResult.test?.maxScore || finishedResult.score || 1}
            />
          </div>

          <div className="text-xs text-slate-500 font-medium px-4 leading-relaxed">
            {passed 
              ? "Чудова робота! Ви успішно подолали кваліфікаційний поріг з результату."
              : "На жаль, набраних балів недостатньо для зарахування тесту. Ви завжди можете повторити спробу!"
            }
          </div>

          <button
            type="button"
            onClick={() => setFinishedResult(null)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Повернутися до тестів
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
          Доступні тестування
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Оберіть тест для перевірки знань. Результат рахується автоматично в режимі реального часу
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-mono animate-pulse">
          Завантаження списку тестів...
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400">
          Наразі у банку немає доступних тестів для проходження.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((t) => {
            const attemptInfo = getTestAttemptInfo(t.id);
            const taken = attemptInfo !== null;

            return (
              <div
                key={t.id}
                className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                      {t.subject}
                    </span>
                    {taken && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Складено
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">{t.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t.questions.length} питань &middot; максимум {t.maxScore} балів</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 mt-5 pt-3.5 gap-4">
                  {taken && attemptInfo ? (
                    <div className="text-xs">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider font-mono">Останній бал</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {attemptInfo.score} / {t.maxScore} ({Math.round((attemptInfo.score / t.maxScore) * 100)}%)
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs font-medium">Новий тест</span>
                  )}

                  <button
                    onClick={() => handleStartTest(t)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 hover:shadow text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {taken ? "Перескласти" : "Розпочати"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
