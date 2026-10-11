import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Search, Trash2, Eye, ShieldAlert, BarChart3, TrendingUp, Calendar, User, CheckCircle2, XCircle, Award } from "lucide-react";
import { api } from "../api";
import { Result } from "../types";
import ScoreRing from "../components/ScoreRing";
import Modal from "../components/Modal";

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Detailed view state
  const [inspectedResult, setInspectedResult] = useState<Result | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getResults();
      setResults(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Не вдалося завантажити результати");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей результат? Ця дія незворотна.")) {
      return;
    }
    try {
      await api.deleteResult(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Помилка при видаленні результату");
    }
  };

  const handleInspect = (res: Result) => {
    setInspectedResult(res);
    setModalOpen(true);
  };

  // Filter based on search query (student name or test title)
  const filteredResults = results.filter(r => 
    (r.student?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.test?.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.student?.group || "").toLowerCase().includes(search.toLowerCase())
  );

  // Compute stats
  const totalConducted = results.length;
  
  const averagePct = totalConducted > 0 
    ? Math.round(
        (results.reduce((sum, r) => sum + (r.score / (r.test?.maxScore || r.score || 1)), 0) / totalConducted) * 100
      )
    : 0;

  const passedCount = results.filter(r => {
    const max = r.test?.maxScore || r.score || 1;
    return (r.score / max) >= 0.6;
  }).length;

  const passRate = totalConducted > 0 ? Math.round((passedCount / totalConducted) * 100) : 0;

  // Find most active test
  const testCounts: { [key: string]: { title: string; count: number } } = {};
  results.forEach(r => {
    if (r.test) {
      if (!testCounts[r.testId]) {
        testCounts[r.testId] = { title: r.test.title, count: 0 };
      }
      testCounts[r.testId].count += 1;
    }
  });
  
  let mostActiveTest = "Немає даних";
  let maxCount = 0;
  Object.values(testCounts).forEach(item => {
    if (item.count > maxCount) {
      maxCount = item.count;
      mostActiveTest = item.title;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
          Відомість та аналітика
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Зведена таблиця успішності, результати тестувань та динаміка проходження по групах
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* STATS BENTO BOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Conducted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Проведено тестів</div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">{totalConducted}</div>
          </div>
        </div>

        {/* Avg Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Сер. успішність</div>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{averagePct}%</div>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-50 rounded-xl text-sky-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Показник успіху</div>
            <div className="text-2xl font-black text-sky-600 font-mono mt-0.5">{passRate}%</div>
          </div>
        </div>

        {/* Most Active Test */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Популярний тест</div>
            <div className="text-sm font-bold text-slate-800 truncate mt-1" title={mostActiveTest}>
              {mostActiveTest}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Segment */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Пошук за студентом, тестом або групою..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="ml-auto text-xs font-mono font-semibold text-slate-400">
          Знайдено спроб: {filteredResults.length} / {results.length}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider font-display uppercase">Студент / Група</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider font-display uppercase">Тема тестування</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider font-display uppercase">Дата складання</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider font-display uppercase">Оцінка</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider font-display uppercase text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-mono animate-pulse">
                    Завантаження відомостей успішності...
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {search ? "За даним запитом відомостей не знайдено." : "Тестування ще не проводилися."}
                  </td>
                </tr>
              ) : (
                filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Column */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {res.student?.name.charAt(0) || "С"}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {res.student?.name || "Студент видалений"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {res.student?.group ? `Група: ${res.student.group}` : "Без групи"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Test Title */}
                    <td className="px-6 py-3.5">
                      <div>
                        <div className="font-semibold text-slate-800">{res.test?.title || "Тест видалений"}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">
                          {res.test?.subject || "Категорія видалена"}
                        </div>
                      </div>
                    </td>

                    {/* Completion Date */}
                    <td className="px-6 py-3.5 text-xs text-slate-500 font-mono">
                      {new Date(res.date).toLocaleDateString("uk-UA", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>

                    {/* Score Ring */}
                    <td className="px-6 py-3.5">
                      <ScoreRing
                        score={res.score}
                        maxScore={res.test?.maxScore || res.score || 1}
                      />
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleInspect(res)}
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Подивитися відповіді"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                        title="Видалити запис"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answer Sheet Inspector Modal */}
      <Modal
        title="Екзаменаційний листок студента"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        {inspectedResult && (
          <div className="space-y-5">
            {/* Student metadata header */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-500" />
                  {inspectedResult.student?.name || "Видалений студент"}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Група: {inspectedResult.student?.group || "немає"} &middot; {inspectedResult.test?.title || "Видалений тест"}
                </p>
              </div>
              <ScoreRing
                score={inspectedResult.score}
                maxScore={inspectedResult.test?.maxScore || inspectedResult.score || 1}
              />
            </div>

            {/* Answer List */}
            <div className="space-y-3.5">
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Детальні відповіді:</h5>
              
              <div className="space-y-3">
                {inspectedResult.answers.map((ans, i) => {
                  const correctVal = inspectedResult.test?.questions.find(
                    q => q.questionText === ans.questionText
                  )?.correctAnswer;

                  return (
                    <div
                      key={i}
                      className={`border rounded-xl p-4 transition-all ${
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs font-mono">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                            Відповідь студента
                          </span>
                          <span className={`font-semibold ${ans.isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                            {ans.selectedAnswer || "(немає відповіді)"}
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
                Закрити відомість
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
