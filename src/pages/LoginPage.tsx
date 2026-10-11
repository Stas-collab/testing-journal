import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  GraduationCap,
  ShieldAlert,
  User,
  LogIn,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { api } from "../api";
import { Student } from "../types";

interface LoginPageProps {
  onLogin: (session: {
    role: "student" | "teacher";
    userId: string | null;
    userName: string;
  }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [error, setError] = useState("");

  // Registration state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regGroup, setRegGroup] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    try {
      // Temporarily write mock credentials to local storage so we can fetch students
      localStorage.setItem(
        "test_app_session",
        JSON.stringify({
          role: "teacher",
          userId: "admin",
          userName: "Викладач",
        }),
      );
      const list = await api.getStudents();
      setStudents(list);
      if (list.length > 0) {
        setSelectedStudentId(list[0].id);
      }
      localStorage.removeItem("test_app_session"); // clean up temp
    } catch (err) {
      console.error("Error loading students list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherPassword.trim() === "admin") {
      setError("");
      onLogin({
        role: "teacher",
        userId: "teacher-admin",
        userName: "Проф. Іван Петрович",
      });
    } else {
      setError("Неправильний пароль викладача! Спробуйте: admin");
    }
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError("Будь ласка, оберіть студента");
      return;
    }
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    onLogin({
      role: "student",
      userId: student.id,
      userName: `${student.name} (${student.group})`,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regGroup) {
      setError("Будь ласка, заповніть усі поля для реєстрації");
      return;
    }
    setError("");
    try {
      // Temp login to call register
      localStorage.setItem(
        "test_app_session",
        JSON.stringify({
          role: "teacher",
          userId: "admin",
          userName: "Викладач",
        }),
      );
      const newStudent = await api.createStudent({
        name: regName,
        email: regEmail,
        group: regGroup,
      });
      localStorage.removeItem("test_app_session");

      setRegSuccess(`Студента ${newStudent.name} успішно зареєстровано!`);
      setRegName("");
      setRegEmail("");
      setRegGroup("");
      setIsRegistering(false);

      // Reload lists and select newly created student
      await loadStudents();
      setSelectedStudentId(newStudent.id);
    } catch (err: any) {
      setError(err.message || "Помилка реєстрації");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full filter blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full filter blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="inline-flex p-3 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-200 mb-4">
          <GraduationCap className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Журнал тестування
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
          Електронний кабінет контролю знань студентів. Оберіть свій кабінет
          нижче:
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-slate-100/80">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-100 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {regSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-xl border border-emerald-100 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-500 animate-pulse" />
              <span>{regSuccess}</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* LEFT SIDE: TEACHER LOGIN */}
            <form
              onSubmit={handleTeacherSubmit}
              className="pb-6 md:pb-0 md:pr-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                    <User className="w-5 h-5" />
                  </span>
                  <h3 className="font-semibold text-slate-800 font-display">
                    Кабінет викладача
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Доступ до конструктора тестів, перегляду відомостей,
                  редагування списку студентів та повної статистики проходжень.
                </p>

                <div className="space-y-1.5">
                  <label
                    htmlFor="teacher-password"
                    className="block text-xs font-semibold text-slate-500"
                  >
                    Введіть пароль доступу
                  </label>
                  <input
                    id="teacher-password"
                    type="password"
                    placeholder="Пароль (за замовчуванням: admin)"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-6 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <LogIn className="w-4 h-4" />
                Ввійти як викладач
              </button>
            </form>

            {/* RIGHT SIDE: STUDENT LOGIN & REGISTRATION */}
            <div className="pt-6 md:pt-0 md:pl-6 flex flex-col justify-between">
              {!isRegistering ? (
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                        <GraduationCap className="w-5 h-5" />
                      </span>
                      <h3 className="font-semibold text-slate-800 font-display">
                        Кабінет студента
                      </h3>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="student-select"
                      className="block text-xs font-semibold text-slate-500 mb-1.5"
                    >
                      Оберіть свій профіль
                    </label>
                    {loading ? (
                      <div className="py-2.5 text-xs text-slate-400 font-mono animate-pulse">
                        Завантаження профілів...
                      </div>
                    ) : students.length === 0 ? (
                      <div className="text-xs text-rose-500 mb-2 font-medium">
                        Студентів у системі ще немає. Зареєструйте першого!
                      </div>
                    ) : (
                      <select
                        id="student-select"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.group})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={students.length === 0}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <LogIn className="w-4 h-4" />
                      Ввійти як студент
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setRegSuccess("");
                        setIsRegistering(true);
                      }}
                      className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 mt-1.5 text-center flex items-center justify-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Створити новий профіль
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 text-sm font-display flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-indigo-600" />
                      Реєстрація студента
                    </h3>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Повне ім'я (напр. Іван Бондар)"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Електронна пошта (email)"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Академічна група (напр. КН-301)"
                      value={regGroup}
                      onChange={(e) => setRegGroup(e.target.value)}
                      required
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold transition-all"
                    >
                      Назад
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold transition-all shadow-sm"
                    >
                      Зберегти
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
