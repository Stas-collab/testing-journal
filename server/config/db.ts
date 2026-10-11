import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { StudentModel, TestModel, ResultModel } from "../models";

export const DB_FILE = path.join(process.cwd(), "db.json");

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
  student?: Student;
  testId: string;
  test?: Test;
  score: number;
  answers: Answer[];
  date: string;
}

export const defaultData = {
  students: [
    {
      id: "std-1",
      name: "Андрій Коваленко",
      email: "andriy.kov@student.edu",
      group: "КН-301",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "std-2",
      name: "Марія Шевченко",
      email: "m.shevchenko@student.edu",
      group: "КН-301",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "std-3",
      name: "Олександр Бондар",
      email: "sasha.bondar@student.edu",
      group: "КН-302",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "std-4",
      name: "Олена Кравченко",
      email: "o.kravchenko@student.edu",
      group: "КН-302",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  tests: [
    {
      id: "test-1",
      title: "Основи JavaScript",
      subject: "Програмування",
      maxScore: 5,
      questions: [
        {
          questionText: "Який метод масиву додає елемент в кінець?",
          options: ["push()", "pop()", "shift()", "unshift()"],
          correctAnswer: "push()",
        },
        {
          questionText:
            "Яке ключове слово створює змінну, яку не можна переприсвоїти?",
          options: ["let", "const", "var", "def"],
          correctAnswer: "const",
        },
        {
          questionText: "Чому дорівнює typeof NaN?",
          options: ["'number'", "'string'", "'undefined'", "'object'"],
          correctAnswer: "'number'",
        },
        {
          questionText:
            "Який оператор використовується для строгого порівняння (з урахуванням типу)?",
          options: ["==", "===", "=", "!="],
          correctAnswer: "===",
        },
        {
          questionText:
            "Який вбудований метод перетворює об'єкт у рядок формату JSON?",
          options: [
            "JSON.stringify()",
            "JSON.parse()",
            "Object.toString()",
            "JSON.toSource()",
          ],
          correctAnswer: "JSON.stringify()",
        },
      ],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "test-2",
      title: "Англійська мова (Intermediate Grammar)",
      subject: "Іноземна мова",
      maxScore: 4,
      questions: [
        {
          questionText:
            "Оберіть правильну форму дієслова: 'She ... to school every day.'",
          options: ["go", "goes", "going", "gone"],
          correctAnswer: "goes",
        },
        {
          questionText: "Яке слово є синонімом до слова 'Quick'?",
          options: ["Fast", "Slow", "Heavy", "Difficult"],
          correctAnswer: "Fast",
        },
        {
          questionText: "Яка форма Past Simple дієслова 'take'?",
          options: ["took", "taken", "takes", "taking"],
          correctAnswer: "took",
        },
        {
          questionText:
            "Завершіть речення: 'If it rains, we ... stay at home.'",
          options: ["will", "would", "are", "have"],
          correctAnswer: "will",
        },
      ],
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  results: [
    {
      id: "res-1",
      studentId: "std-1",
      testId: "test-1",
      score: 4,
      answers: [
        {
          questionText: "Який метод масиву додає елемент в кінець?",
          selectedAnswer: "push()",
          isCorrect: true,
        },
        {
          questionText:
            "Яке ключове слово створює змінну, яку не можна переприсвоїти?",
          selectedAnswer: "let",
          isCorrect: false,
        },
        {
          questionText: "Чому дорівнює typeof NaN?",
          selectedAnswer: "'number'",
          isCorrect: true,
        },
        {
          questionText:
            "Який оператор використовується для строгого порівняння (з урахуванням типу)?",
          selectedAnswer: "===",
          isCorrect: true,
        },
        {
          questionText:
            "Який вбудований метод перетворює об'єкт у рядок формату JSON?",
          selectedAnswer: "JSON.stringify()",
          isCorrect: true,
        },
      ],
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "res-2",
      studentId: "std-2",
      testId: "test-1",
      score: 5,
      answers: [
        {
          questionText: "Який метод масиву додає елемент в кінець?",
          selectedAnswer: "push()",
          isCorrect: true,
        },
        {
          questionText:
            "Яке ключове слово створює змінну, яку не можна переприсвоїти?",
          selectedAnswer: "const",
          isCorrect: true,
        },
        {
          questionText: "Чому дорівнює typeof NaN?",
          selectedAnswer: "'number'",
          isCorrect: true,
        },
        {
          questionText:
            "Який оператор використовується для строгого порівняння (з урахуванням типу)?",
          selectedAnswer: "===",
          isCorrect: true,
        },
        {
          questionText:
            "Який вбудований метод перетворює об'єкт у рядок формату JSON?",
          selectedAnswer: "JSON.stringify()",
          isCorrect: true,
        },
      ],
      date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "res-3",
      studentId: "std-3",
      testId: "test-2",
      score: 3,
      answers: [
        {
          questionText:
            "Оберіть правильну форму дієслова: 'She ... to school every day.'",
          selectedAnswer: "goes",
          isCorrect: true,
        },
        {
          questionText: "Яке слово є синонімом до слова 'Quick'?",
          selectedAnswer: "Fast",
          isCorrect: true,
        },
        {
          questionText: "Яка форма Past Simple дієслова 'take'?",
          selectedAnswer: "taken",
          isCorrect: false,
        },
        {
          questionText:
            "Завершіть речення: 'If it rains, we ... stay at home.'",
          selectedAnswer: "will",
          isCorrect: true,
        },
      ],
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

export function readDB(): typeof defaultData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
      return defaultData;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Помилка читання JSON файлу:", err);
    return defaultData;
  }
}

export function writeDB(data: typeof defaultData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Помилка запису в JSON файл:", err);
  }
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studenttests";
export let mongoConnected = false;

async function seedDatabase() {
  try {
    const studentCount = await StudentModel.countDocuments();
    if (studentCount === 0) {
      console.log(
        "Колекція студентів порожня. Виконуємо первинне наповнення...",
      );
      await StudentModel.insertMany(defaultData.students);
    }

    const testCount = await TestModel.countDocuments();
    if (testCount === 0) {
      console.log("Колекція тестів порожня. Виконуємо первинне наповнення...");
      await TestModel.insertMany(defaultData.tests);
    }

    const resultCount = await ResultModel.countDocuments();
    if (resultCount === 0) {
      console.log(
        "Колекція результатів порожня. Виконуємо первинне наповнення...",
      );
      await ResultModel.insertMany(defaultData.results);
    }
    console.log("База даних MongoDB успішно верифікована та наповнена!");
  } catch (error) {
    console.error("Помилка під час наповнення MongoDB:", error);
  }
}

export async function connectToMongo() {
  try {
    console.log(`Підключення до MongoDB за адресою: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    mongoConnected = true;
    console.log("Успішно підключено до MongoDB! Використовуємо NoSQL сховище.");
    await seedDatabase();
  } catch (err) {
    console.warn(
      "Не вдалося підключитися до MongoDB. Автоматичний перехід на локальне файлове сховище 'db.json'.",
    );
    console.warn(
      "Перевірте, чи запущена служба MongoDB на локальному комп'ютері (порт 27017).",
    );
    mongoConnected = false;
  }
}
