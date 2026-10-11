import { Student, Test, Result, TestAnalysis, Recommendations } from "./types";

// Dynamic header resolution based on current login session
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  try {
    const sessionStr = localStorage.getItem("test_app_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.role) {
        headers["x-user-role"] = session.role;
      }
      if (session.userId) {
        headers["x-user-id"] = session.userId;
      }
    }
  } catch (err) {
    console.error("Error reading session for headers:", err);
  }

  return headers;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errMsg = "Помилка сервера";
    try {
      const errData = await response.json();
      errMsg = errData.message || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Students
  getStudents: () => request<Student[]>("/api/students"),
  getStudentById: (id: string) => request<Student>(`/api/students/${id}`),
  createStudent: (data: { name: string; email: string; group: string }) =>
    request<Student>("/api/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStudent: (
    id: string,
    data: { name: string; email: string; group: string },
  ) =>
    request<Student>(`/api/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteStudent: (id: string) =>
    request<{ message: string }>(`/api/students/${id}`, {
      method: "DELETE",
    }),

  // Tests
  getTests: () => request<Test[]>("/api/tests"),
  getTestById: (id: string) => request<Test>(`/api/tests/${id}`),
  createTest: (data: Omit<Test, "id" | "createdAt">) =>
    request<Test>("/api/tests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTest: (id: string, data: Omit<Test, "id" | "createdAt">) =>
    request<Test>(`/api/tests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTest: (id: string) =>
    request<{ message: string }>(`/api/tests/${id}`, {
      method: "DELETE",
    }),

  // Results
  getResults: () => request<Result[]>("/api/results"),
  getResultById: (id: string) => request<Result>(`/api/results/${id}`),
  getResultsByStudent: (studentId: string) =>
    request<Result[]>(`/api/results/student/${studentId}`),
  createResult: (data: {
    test: string;
    answers: { questionText: string; selectedAnswer: string }[];
  }) =>
    request<Result>("/api/results", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteResult: (id: string) =>
    request<{ message: string }>(`/api/results/${id}`, {
      method: "DELETE",
    }),

  // Analytics
  getQuestionAnalytics: () =>
    request<TestAnalysis[]>("/api/analytics/questions"),
  getRecommendations: (studentId: string) =>
    request<Recommendations>(`/api/analytics/recommendations/${studentId}`),
};
