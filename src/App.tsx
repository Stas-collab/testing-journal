import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Clipboard,
  BookOpen,
  Award,
  LogOut,
  BarChart3,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

// Page imports
import LoginPage from "./pages/LoginPage";
import StudentsPage from "./pages/StudentsPage";
import TestsPage from "./pages/TestsPage";
import ResultsPage from "./pages/ResultsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import StudentTestsPage from "./pages/StudentTestsPage";
import StudentResultsPage from "./pages/StudentResultsPage";

interface Session {
  role: "student" | "teacher";
  userId: string | null;
  userName: string;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("test_app_session");
      if (saved) {
        const parsed = JSON.parse(saved) as Session;
        setSession(parsed);
        // Default first tab based on role
        setActiveTab(parsed.role === "teacher" ? "students" : "tests");
      }
    } catch (err) {
      console.error("Error loading session:", err);
    }
  }, []);

  const handleLogin = (newSession: Session) => {
    localStorage.setItem("test_app_session", JSON.stringify(newSession));
    setSession(newSession);
    setActiveTab(newSession.role === "teacher" ? "students" : "tests");
  };

  const handleLogout = () => {
    localStorage.removeItem("test_app_session");
    setSession(null);
    setActiveTab("");
  };

  // If no session, render the high-fidelity login portal
  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Sidebar navigation configurations
  const teacherTabs = [
    {
      id: "students",
      label: "Студенти",
      icon: Users,
      component: <StudentsPage />,
    },
    {
      id: "tests",
      label: "Конструктор тестів",
      icon: Clipboard,
      component: <TestsPage />,
    },
    {
      id: "results",
      label: "Відомість оцінок",
      icon: Award,
      component: <ResultsPage />,
    },
    {
      id: "analytics",
      label: "Аналіз питань",
      icon: BarChart3,
      component: <AnalyticsPage />,
    },
  ];

  const studentTabs = [
    {
      id: "tests",
      label: "Перелік тестів",
      icon: BookOpen,
      component: <StudentTestsPage studentId={session.userId || ""} />,
    },
    {
      id: "results",
      label: "Моя успішність",
      icon: Award,
      component: <StudentResultsPage studentId={session.userId || ""} />,
    },
  ];

  const activeTabsList = session.role === "teacher" ? teacherTabs : studentTabs;
  const currentTabObj =
    activeTabsList.find((t) => t.id === activeTab) || activeTabsList[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
        {/* Brand Banner */}
        <div className="px-6 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight tracking-tight font-display">
              Журнал
            </h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Тестування
            </p>
          </div>
        </div>

        {/* User profile card */}
        <div className="p-4 bg-slate-50 m-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-700 font-bold text-xs font-mono uppercase">
              {session.role === "teacher" ? "В" : "С"}
            </div>
            <div className="overflow-hidden min-w-0">
              <p
                className="text-xs font-bold text-slate-800 truncate"
                title={session.userName}
              >
                {session.userName}
              </p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                {session.role === "teacher" ? "Викладач" : "Студент"}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar Links */}
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Основне
          </div>
          {activeTabsList.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all outline-none ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto stroke-[3] text-indigo-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 border border-slate-200 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Змінити роль
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER PANEL */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full overflow-hidden">
        {/* Dynamic AnimatePresence Page Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {currentTabObj ? (
              currentTabObj.component
            ) : (
              <div className="text-slate-400 text-xs">Невідома вкладка</div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
