import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Award, Eye, ClipboardCheck, Sparkles, HelpCircle, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { api } from "../api";
import { Result } from "../types";
import ScoreRing from "../components/ScoreRing";
import Modal from "../components/Modal";

interface StudentResultsPageProps {
  studentId: string;
}

export default function StudentResultsPage({ studentId }: StudentResultsPageProps) {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inspect state
  const [inspectedResult, setInspectedResult] = useState<Result | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getResultsByStudent(studentId);
      setResults(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Помилка завантаження результатів");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleInspect = (res: Result) => {
    setInspectedResult(res);
    setModalOpen(true);
  };

  // Stats calculation
  const totalConducted = results.length;
  
  const averagePct = totalConducted > 0 
    ? Math.round(
        (results.reduce((sum, r) => sum + (r.score / (r.test?.maxScore || r.score || 1)), 0) / totalConducted) * 100
      )
    : 0;

  const bestScorePct = totalConducted > 0
    ? Math.round(
        Math.max(...results.map(r => r.score / (r.test?.maxScore || r.score || 1))) * 100
      )
    : 0;

  const passedCount = results.filter(r => {
    const max = r.test?.maxScore || r.score || 1;
    return (r.score / max) >= 0.6;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
          Мої результати
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Історія складених вами тестів, бали та детальний аналіз відповідей
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* STATS Segment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Taken */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Складено тестів</div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">{totalConducted}</div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-display">Середній відсоток</div>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{averagePct}%</div>
          </div>
        </div>

        {/* Best Attempt */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Найкращий результат</div>
            <div className="text-2xl font-black text-amber-500 font-mono mt-0.5">{bestScorePct}%</div>
          </div>
        </div>
      </div>

      {/* Attempts log */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide font-display">Історія спроб</h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-mono animate-pulse bg-white border border-slate-100 rounded-2xl">
            Завантаження результатів...
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400">
            Ви ще не проходили жодного тесту. Оберіть тест на сусідній вкладці!
          </div>
        ) : (
          <div className="grid gap-3">
            {results.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-slate-200 transition-all gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <ScoreRing
                    score={r.score}
                    maxScore={r.test?.maxScore || r.score || 1}
                  />
                  
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 font-display truncate">
                      {r.test?.title || "Видалений тест"}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium uppercase mt-0.5">
                      {r.test?.subject} &middot; {new Date(r.date).toLocaleDateString("uk-UA")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleInspect(r)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors px-3.5 py-2 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 border border-transparent"
                >
                  Детальніше
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details inspector modal */}
      <Modal
        title="Ваш екзаменаційний листок"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        {inspectedResult && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  {inspectedResult.test?.title || "Видалений тест"}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Складено: {new Date(inspectedResult.date).toLocaleDateString("uk-UA")}
                </p>
              </div>
              <ScoreRing
                score={inspectedResult.score}
                maxScore={inspectedResult.test?.maxScore || inspectedResult.score || 1}
              />
            </div>

            {/* Answer feedback */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ваші відповіді:</h5>

              <div className="space-y-3">
                {inspectedResult.answers.map((ans, i) => {
                  const correctVal = inspectedResult.test?.questions.find(
                    q => q.questionText === ans.questionText
                  )?.correctAnswer;

                  return (
                    <div
                      key={i}
                      className={`border rounded-xl p-4 ${
                        ans.isCorrect
                          ? "bg-emerald-50/40 border-emerald-100/80"
                          : "bg-rose-50/40 border-rose-100/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-bold text-slate-800 leading-normal">
                          {i + 1}. {ans.questionText}
                        </p>
                        {ans.isCorrect ? (
                          <span className="p-0.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="p-0.5 bg-rose-100 text-rose-700 rounded-full shrink-0">
                            <XCircle className="w-4 h-4" />
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 text-xs font-mono">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                            Ваша відповідь
                          </span>
                          <span className={`font-semibold ${ans.isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                            {ans.selectedAnswer || "(без відповіді)"}
                          </span>
                        </div>

                        {!ans.isCorrect && correctVal && (
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                              Очікувана (правильна)
                            </span>
                            <span className="font-semibold text-emerald-700">
                              {correctVal}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                Закрити звіт
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
