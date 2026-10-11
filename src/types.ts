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
  test?: Test;       // Populated by server
  score: number;
  answers: Answer[];
  date: string;
}
