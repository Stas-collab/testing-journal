import React, { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { api } from "../api";
import { Recommendations } from "../types";

export default function RecommendationsPanel({
  studentId,
}: {
  studentId: string;
}) {
  const [rec, setRec] = useState<Recommendations | null>(null);

  useEffect(() => {
    api
      .getRecommendations(studentId)
      .then(setRec)
      .catch(() => setRec(null));
  }, [studentId]);

  if (!rec) return null;

  const nothing =
    rec.weakSubjects.length === 0 &&
    rec.retake.length === 0 &&
    rec.notTaken.length === 0;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide font-display">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        Персональні рекомендації
      </h3>

      {nothing && (
        <p className="text-xs text-slate-500">
          Усі тести складено успішно. Рекомендацій немає.
        </p>
      )}

      {rec.weakSubjects.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 mb-1.5">
            Слабкі предмети
          </h4>
          <ul className="space-y-1 text-xs text-slate-700">
            {rec.weakSubjects.map((s) => (
              <li key={s.subject}>
                {s.subject}:{" "}
                <span className="font-mono font-bold text-rose-600">
                  {Math.round(s.avgPct * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rec.retake.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 mb-1.5">
            Варто перескласти
          </h4>
          <ul className="space-y-1 text-xs text-slate-700">
            {rec.retake.map((t) => (
              <li key={t.testId}>
                {t.title}{" "}
                <span className="font-mono text-slate-400">
                  ({Math.round(t.pct * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rec.notTaken.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 mb-1.5">
            Ще не пройдено
          </h4>
          <ul className="space-y-1 text-xs text-slate-700">
            {rec.notTaken.map((t) => (
              <li key={t.testId}>{t.title}</li>
            ))}
          </ul>
        </div>
      )}

      {rec.mistakes.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 mb-1.5">
            Повторіть ці питання
          </h4>
          <ul className="space-y-2 text-xs">
            {rec.mistakes.map((m, i) => (
              <li key={i} className="p-2.5 bg-slate-50 rounded-lg">
                <div className="font-semibold text-slate-800">
                  {m.questionText}
                </div>
                <div className="font-mono mt-0.5">
                  <span className="text-rose-600">
                    {m.selectedAnswer || "(без відповіді)"}
                  </span>
                  {" → "}
                  <span className="text-emerald-700">{m.correctAnswer}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
