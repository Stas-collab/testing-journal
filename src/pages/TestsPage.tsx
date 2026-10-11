import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus, Search, Edit2, Trash2, ClipboardCheck, AlertCircle, BookOpen, Trash, HelpCircle, Layers } from "lucide-react";
import { api } from "../api";
import { Test, Question } from "../types";
import Modal from "../components/Modal";

const emptyQuestion: Question = { questionText: "", options: [], correctAnswer: "" };

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal and Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMaxScore, setFormMaxScore] = useState<number>(100);
  const [questions, setQuestions] = useState<Array<{ questionText: string; optionsRaw: string; correctAnswer: string }>>([]);
  const [submitError, setSubmitError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getTests();
      setTests(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Не вдалося завантажити тести");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingTest(null);
    setFormTitle("");
    setFormSubject("");
    setFormMaxScore(100);
    // Initial dynamic question
    setQuestions([{ questionText: "", optionsRaw: "", correctAnswer: "" }]);
    setSubmitError("");
    setModalOpen(true);
  };

  const openEditModal = (test: Test) => {
    setEditingTest(test);
    setFormTitle(test.title);
    setFormSubject(test.subject);
    setFormMaxScore(test.maxScore);
    setQuestions(test.questions.map(q => ({
      questionText: q.questionText,
      optionsRaw: q.options.join(", "),
      correctAnswer: q.correctAnswer
    })));
    setSubmitError("");
    setModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити тест "${title}"? Це також видалить усі пов'язані оцінки студентів.`)) {
      return;
    }
    try {
      await api.deleteTest(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Не вдалося видалити тест");
    }
  };

  // Dynamic Questions Helpers
  const addQuestionField = () => {
    setQuestions([...questions, { questionText: "", optionsRaw: "", correctAnswer: "" }]);
  };

  const removeQuestionField = (index: number) => {
    if (questions.length === 1) {
      alert("Тест повинен містити хоча б одне питання!");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionField = (index: number, field: "questionText" | "optionsRaw" | "correctAnswer", value: string) => {
    const list = [...questions];
    list[index][field] = value;
    setQuestions(list);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!formTitle.trim() || !formSubject.trim()) {
      setSubmitError("Введіть назву та предмет тесту");
      return;
    }

    // Validate and map questions
    const compiledQuestions: Question[] = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setSubmitError(`Текст питання #${i + 1} є порожнім`);
        return;
      }
      
      const parsedOptions = q.optionsRaw
        .split(",")
        .map(o => o.trim())
        .filter(Boolean);

      if (parsedOptions.length === 0) {
        setSubmitError(`Вкажіть варіанти відповідей для питання #${i + 1} через кому`);
        return;
      }

      if (!q.correctAnswer.trim()) {
        setSubmitError(`Вкажіть правильну відповідь для питання #${i + 1}`);
        return;
      }

      if (!parsedOptions.includes(q.correctAnswer.trim())) {
        setSubmitError(`Правильна відповідь для питання #${i + 1} повинна співпадати з одним із перелічених варіантів`);
        return;
      }

      compiledQuestions.push({
        questionText: q.questionText.trim(),
        options: parsedOptions,
        correctAnswer: q.correctAnswer.trim()
      });
    }

    try {
      const payload = {
        title: formTitle,
        subject: formSubject,
        maxScore: Number(formMaxScore) || compiledQuestions.length,
        questions: compiledQuestions
      };

      if (editingTest) {
        await api.updateTest(editingTest.id, payload);
      } else {
        await api.createTest(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setSubmitError(err.message || "Не вдалося зберегти тест");
    }
  };

  const filteredTests = tests.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Банк тестів
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Керування питаннями, темами та максимальними балами для перевірки знань
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-150 transition-colors shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          Створити тест
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Filter and stats segment */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Пошук за назвою або предметом..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs font-mono font-semibold text-slate-400">
          <ClipboardCheck className="w-4 h-4 text-indigo-500" />
          <span>Доступно тестів: {filteredTests.length} / {tests.length}</span>
        </div>
      </div>

      {/* Grid of tests */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-mono animate-pulse">
          Завантаження тестової бази...
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400">
          {search ? "Не знайдено жодного тесту за вашим запитом." : "Банк тестів порожній. Створіть свій перший тест, натиснувши кнопку зверху!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                    {test.subject}
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-slate-400">
                    Макс: {test.maxScore} бал.
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3 font-display">
                  {test.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{test.questions.length} питань у тесті</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 mt-5 pt-3.5">
                <span className="text-[10px] font-mono text-slate-400">
                  Створено: {new Date(test.createdAt).toLocaleDateString("uk-UA")}
                </span>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditModal(test)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                    title="Редагувати"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(test.id, test.title)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-xl transition-all"
                    title="Видалити"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal Form */}
      <Modal
        title={editingTest ? "Редагувати параметри тесту" : "Створити новий тест"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
          {submitError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-rose-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Назва тесту *</label>
              <input
                type="text"
                required
                placeholder="напр. Основи програмування"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Предмет (категорія) *</label>
              <input
                type="text"
                required
                placeholder="напр. Програмування"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Максимальний бал *</label>
            <input
              type="number"
              required
              min={1}
              value={formMaxScore}
              onChange={(e) => setFormMaxScore(Number(e.target.value))}
              className="w-32 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-1">Оцінка за тест буде автоматично масштабуватися до цієї величини.</p>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Список питань ({questions.length})
              </h4>
              <button
                type="button"
                onClick={addQuestionField}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                + Додати питання
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-600">Питання #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestionField(index)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 transition-colors"
                      title="Вилучити це питання"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Текст запитання"
                      value={q.questionText}
                      onChange={(e) => updateQuestionField(index, "questionText", e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Варіанти (через кому) *</label>
                      <input
                        type="text"
                        required
                        placeholder="напр. Варіант 1, Варіант 2, Варіант 3"
                        value={q.optionsRaw}
                        onChange={(e) => updateQuestionField(index, "optionsRaw", e.target.value)}
                        className="w-full text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Правильний варіант *</label>
                      <input
                        type="text"
                        required
                        placeholder="має точно відповідати одному з варіантів"
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestionField(index, "correctAnswer", e.target.value)}
                        className="w-full text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold transition-all"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm"
            >
              Зберегти тест
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
