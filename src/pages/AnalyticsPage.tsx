import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api } from "../api";
import { TestAnalysis, QuestionStat } from "../types";

const barColor: Record<QuestionStat["difficulty"], string> = {
  hard: "bg-rose-500",
  medium: "bg-amber-400",
  easy: "bg-emerald-500",
};

const label: Record<QuestionStat["difficulty"], string> = {
  hard: "Складне",
  medium: "Середнє",
  easy: "Легке",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<TestAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getQuestionAnalytics()
      .then(setData)
      .catch((err) =>
        setError(err.message || "Не вдалося завантажити аналітику"),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
          Аналіз складності питань
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Відсоток правильних відповідей на кожне питання. Питання, на які майже
          ніхто не відповів правильно, варто перевірити на хибний ключ
          відповіді.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-mono animate-pulse">
          Аналіз даних...
        </div>
      ) : (
        data.map((t) => (
          <div
            key={t.testId}
            className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 font-display">
                  {t.title}
                </h3>
                <p className="text-[11px] text-slate-400 uppercase font-medium mt-0.5">
                  {t.subject}
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-500">
                <div>Спроб: {t.attempts}</div>
                <div>Сер. результат: {Math.round(t.avgPct * 100)}%</div>
              </div>
            </div>

            {t.attempts === 0 ? (
              <p className="text-xs text-slate-400">
                Цей тест ще ніхто не проходив.
              </p>
            ) : (
              <div className="space-y-3">
                {t.questions.map((q) => (
                  <div key={q.questionText}>
                    <div className="flex items-center justify-between gap-3 text-xs mb-1">
                      <span className="font-semibold text-slate-700">
                        {q.questionText}
                      </span>
                      <span className="font-mono text-slate-500 shrink-0">
                        {Math.round(q.correctRate * 100)}% ·{" "}
                        {label[q.difficulty]}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor[q.difficulty]}`}
                        style={{ width: `${Math.round(q.correctRate * 100)}%` }}
                      />
                    </div>
                    {q.suspicious && (
                      <p className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        Майже ніхто не відповів правильно. Перевірте
                        правильність ключа.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
