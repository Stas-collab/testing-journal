import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus, Search, Edit2, Trash2, GraduationCap, Users, Mail, Layers } from "lucide-react";
import { api } from "../api";
import { Student } from "../types";
import Modal from "../components/Modal";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  
  // Modal & Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formGroup, setFormGroup] = useState("");
  const [submitError, setFormSubmitError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Не вдалося завантажити список студентів");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormName("");
    setFormEmail("");
    setFormGroup("");
    setFormSubmitError("");
    setModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormEmail(student.email);
    setFormGroup(student.group);
    setFormSubmitError("");
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Ви дійсно бажаєте видалити студента "${name}"? Це також видалить усі пов'язані результати тестів.`)) {
      return;
    }
    try {
      await api.deleteStudent(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Не вдалося видалити студента");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitError("");
    
    if (!formName.trim() || !formEmail.trim() || !formGroup.trim()) {
      setFormSubmitError("Будь ласка, заповніть усі обов'язкові поля");
      return;
    }

    try {
      if (editingStudent) {
        await api.updateStudent(editingStudent.id, {
          name: formName,
          email: formEmail,
          group: formGroup
        });
      } else {
        await api.createStudent({
          name: formName,
          email: formEmail,
          group: formGroup
        });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormSubmitError(err.message || "Помилка збереження студента");
    }
  };

  // Filter students based on search string
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.group.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Керування студентами
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Загальний реєстр та академічні групи студентів у системі контролю знань
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-150 transition-colors shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          Додати студента
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
            placeholder="Пошук за ім'ям, групою чи email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs font-mono font-semibold text-slate-400">
          <Users className="w-4 h-4 text-indigo-500" />
          <span>Знайдено: {filteredStudents.length} / {students.length}</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider font-display uppercase">Ім'я студента</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider font-display uppercase">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider font-display uppercase">Академічна група</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 tracking-wider font-display uppercase text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-mono animate-pulse">
                    Завантаження списку студентів...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    {search ? "Студентів за даним запитом не знайдено." : "У системі ще немає зареєстрованих студентів."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{student.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <Layers className="w-3 h-3 text-slate-500" />
                        {student.group}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(student)}
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Редагувати"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id, student.name)}
                        className="inline-flex p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                        title="Видалити"
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

      {/* Modal form */}
      <Modal
        title={editingStudent ? "Редагувати профіль студента" : "Створити профіль студента"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {submitError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-rose-100">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Повне ім'я студента *</label>
            <input
              type="text"
              required
              placeholder="напр. Андрій Коваленко"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Email адреса *</label>
            <input
              type="email"
              required
              placeholder="andriy@student.edu"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Академічна група *</label>
            <input
              type="text"
              required
              placeholder="напр. КН-301"
              value={formGroup}
              onChange={(e) => setFormGroup(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            />
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
              Зберегти
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
