"use client";

import { useEffect, useState } from "react";
import {
  createClass,
  listClasses,
  listStudents,
  registerStudent,
  type Class,
  type Student,
} from "@/lib/api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const CLASS_EMPTY = {
  name: "",
  subject: "",
  day_of_week: "Monday",
  time_slot: "",
  teacher_name: "",
  max_students: 20,
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // ── Add class modal ──────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [classForm, setClassForm] = useState(CLASS_EMPTY);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // ── Register modal ───────────────────────────────────────────────────────
  const [registerTarget, setRegisterTarget] = useState<Class | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const loadClasses = () =>
    listClasses().then(setClasses).catch(() => {});

  useEffect(() => {
    loadClasses();
    listStudents().then(setStudents).catch(() => {});
  }, []);

  const byDay = DAYS.reduce<Record<string, Class[]>>((acc, day) => {
    acc[day] = classes.filter((c) => c.day_of_week === day);
    return acc;
  }, {});

  // ── Handle add class ─────────────────────────────────────────────────────
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      await createClass({
        ...classForm,
        max_students: Number(classForm.max_students),
      });
      setShowAddModal(false);
      setClassForm(CLASS_EMPTY);
      loadClasses();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setAddLoading(false);
    }
  };

  // ── Handle register ──────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!registerTarget || !selectedStudentId) return;
    setRegError("");
    setRegSuccess("");
    setRegLoading(true);
    try {
      await registerStudent(registerTarget.id, Number(selectedStudentId));
      setRegSuccess("✅ Registered successfully!");
      setSelectedStudentId("");
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRegLoading(false);
    }
  };

  const openRegister = (cls: Class) => {
    setRegisterTarget(cls);
    setRegError("");
    setRegSuccess("");
    setSelectedStudentId("");
  };

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Weekly Schedule</h1>
        <button
          onClick={() => {
            setClassForm(CLASS_EMPTY);
            setAddError("");
            setShowAddModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add Class
        </button>
      </div>

      {/* ── Weekly table ────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table
          className="w-full border-collapse bg-white"
          style={{ minWidth: "980px" }}
        >
          <thead>
            <tr>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="border-b border-r last:border-r-0 p-3 bg-indigo-600 text-white text-sm font-semibold"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{DAY_SHORT[day]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {DAYS.map((day) => (
                <td
                  key={day}
                  className="border-r last:border-r-0 p-2 align-top"
                  style={{ minHeight: "160px", verticalAlign: "top" }}
                >
                  <div className="space-y-2 min-h-[140px]">
                    {byDay[day].length === 0 ? (
                      <p className="text-gray-300 text-xs text-center pt-6">
                        —
                      </p>
                    ) : (
                      byDay[day].map((cls) => (
                        <ClassCard
                          key={cls.id}
                          cls={cls}
                          onRegister={() => openRegister(cls)}
                        />
                      ))
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Add Class Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} title="Add New Class">
          <form onSubmit={handleAddClass} className="space-y-3">
            <MField label="Class name" required>
              <input
                required
                placeholder="Toan 5"
                value={classForm.name}
                onChange={(e) =>
                  setClassForm({ ...classForm, name: e.target.value })
                }
                className={minput}
              />
            </MField>

            <MField label="Subject" required>
              <input
                required
                placeholder="Mathematics"
                value={classForm.subject}
                onChange={(e) =>
                  setClassForm({ ...classForm, subject: e.target.value })
                }
                className={minput}
              />
            </MField>

            <div className="grid grid-cols-2 gap-3">
              <MField label="Day of week" required>
                <select
                  value={classForm.day_of_week}
                  onChange={(e) =>
                    setClassForm({ ...classForm, day_of_week: e.target.value })
                  }
                  className={minput}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </MField>

              <MField label="Time slot" required>
                <input
                  required
                  placeholder="08:00-10:00"
                  value={classForm.time_slot}
                  onChange={(e) =>
                    setClassForm({ ...classForm, time_slot: e.target.value })
                  }
                  className={minput}
                />
              </MField>
            </div>

            <MField label="Teacher name" required>
              <input
                required
                placeholder="Tran Thi C"
                value={classForm.teacher_name}
                onChange={(e) =>
                  setClassForm({ ...classForm, teacher_name: e.target.value })
                }
                className={minput}
              />
            </MField>

            <MField label="Max students" required>
              <input
                required
                type="number"
                min={1}
                value={classForm.max_students}
                onChange={(e) =>
                  setClassForm({
                    ...classForm,
                    max_students: Number(e.target.value),
                  })
                }
                className={minput}
              />
            </MField>

            {addError && <p className="text-red-600 text-sm">{addError}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className={secondaryBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className={primaryBtn}
              >
                {addLoading ? "Creating…" : "Create Class"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Register Modal ───────────────────────────────────────────────── */}
      {registerTarget && (
        <Modal
          onClose={() => setRegisterTarget(null)}
          title={`Register Student`}
        >
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold">{registerTarget.name}</span> —{" "}
            {registerTarget.subject}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {registerTarget.day_of_week} · {registerTarget.time_slot} · 👨‍🏫{" "}
            {registerTarget.teacher_name} · Max: {registerTarget.max_students}
          </p>

          {students.length === 0 ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 mb-4">
              ⚠️ No students found. Please{" "}
              <a href="/students" className="underline font-medium">
                create a student
              </a>{" "}
              first.
            </div>
          ) : (
            <MField label="Select student" required>
              <select
                value={selectedStudentId}
                onChange={(e) =>
                  setSelectedStudentId(Number(e.target.value))
                }
                className={minput}
              >
                <option value="">-- select student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · Grade {s.current_grade} · Parent:{" "}
                    {s.parent.name}
                  </option>
                ))}
              </select>
            </MField>
          )}

          <p className="text-xs text-gray-400 mt-2 mb-4">
            ℹ️ Student must have an active subscription with remaining sessions.
          </p>

          {regError && (
            <p className="text-red-600 text-sm mb-3">{regError}</p>
          )}
          {regSuccess && (
            <p className="text-green-600 text-sm mb-3">{regSuccess}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRegisterTarget(null)}
              className={secondaryBtn}
            >
              Close
            </button>
            <button
              onClick={handleRegister}
              disabled={!selectedStudentId || regLoading || !!regSuccess}
              className={primaryBtn}
            >
              {regLoading ? "Registering…" : "Register"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── ClassCard ─────────────────────────────────────────────────────────────────

function ClassCard({
  cls,
  onRegister,
}: {
  cls: Class;
  onRegister: () => void;
}) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
      <p className="font-semibold text-sm text-gray-800 truncate">{cls.name}</p>
      <p className="text-xs text-indigo-600 font-medium truncate">
        {cls.subject}
      </p>
      <span className="inline-block mt-1 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
        {cls.time_slot}
      </span>
      <p className="text-xs text-gray-500 mt-1 truncate">
        👨‍🏫 {cls.teacher_name}
      </p>
      <p className="text-xs text-gray-400">Max: {cls.max_students}</p>
      <button
        onClick={onRegister}
        className="mt-2 w-full text-xs border border-indigo-500 text-indigo-600 rounded-md px-2 py-1 hover:bg-indigo-100 transition-colors"
      >
        Register Student
      </button>
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── tiny bits ─────────────────────────────────────────────────────────────────

const minput =
  "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
const primaryBtn =
  "flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors";
const secondaryBtn =
  "flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors";

function MField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
