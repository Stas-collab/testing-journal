export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  maxScore: number;
  questions: Question[];
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  group: string;
  createdAt: string;
}

export interface Answer {
  questionText: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface Result {
  id: string;
  studentId: string;
  student?: Student; // Populated by server
  testId: string;
  test?: Test; // Populated by server
  score: number;
  answers: Answer[];
  date: string;
}
export interface QuestionStat {
  questionText: string;
  attempts: number;
  correctRate: number;
  difficulty: "hard" | "medium" | "easy";
  suspicious: boolean;
}

export interface TestAnalysis {
  testId: string;
  title: string;
  subject: string;
  attempts: number;
  avgPct: number;
  questions: QuestionStat[];
}

export interface Recommendations {
  weakSubjects: { subject: string; avgPct: number }[];
  retake: { testId: string; title: string; subject: string; pct: number }[];
  notTaken: { testId: string; title: string; subject: string }[];
  mistakes: {
    testTitle: string;
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
  }[];
}
