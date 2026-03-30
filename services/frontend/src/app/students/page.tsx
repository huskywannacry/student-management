"use client";

import { useEffect, useState } from "react";
import {
  createStudent,
  listParents,
  listStudents,
  type Parent,
  type Student,
} from "@/lib/api";

const EMPTY = {
  name: "",
  dob: "",
  gender: "male" as "male" | "female" | "other",
  current_grade: "",
  parent_id: 0,
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    listStudents().then(setStudents).catch(() => {});
    listParents().then(setParents).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parent_id) {
      setError("Please select a parent.");
      return;
    }
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await createStudent(form);
      setSuccess("Student created successfully!");
      setForm(EMPTY);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Students</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ── Create form ── */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add Student</h2>

          {parents.length === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              ⚠️ No parents found. Please{" "}
              <a href="/parents" className="underline font-medium">
                create a parent
              </a>{" "}
              first.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name" required>
              <input
                required
                placeholder="Nguyen Van B"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={input}
              />
            </Field>

            <Field label="Date of birth" required>
              <input
                required
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className={input}
              />
            </Field>

            <Field label="Gender" required>
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gender: e.target.value as "male" | "female" | "other",
                  })
                }
                className={input}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field label="Current grade" required>
              <input
                required
                placeholder="5A"
                value={form.current_grade}
                onChange={(e) =>
                  setForm({ ...form, current_grade: e.target.value })
                }
                className={input}
              />
            </Field>

            <Field label="Parent" required>
              <select
                required
                value={form.parent_id || ""}
                onChange={(e) =>
                  setForm({ ...form, parent_id: Number(e.target.value) })
                }
                className={input}
              >
                <option value="">-- select parent --</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            </Field>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? "Creating…" : "Create Student"}
            </button>
          </form>
        </div>

        {/* ── List ── */}
        <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">
            Student List{" "}
            <span className="text-sm font-normal text-gray-400">
              ({students.length})
            </span>
          </h2>
          {students.length === 0 ? (
            <p className="text-gray-400 text-sm">No students yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b text-gray-500">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">DOB</th>
                  <th className="pb-2">Grade</th>
                  <th className="pb-2">Parent</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 text-gray-400">{s.id}</td>
                    <td className="py-2 font-medium">{s.name}</td>
                    <td className="py-2">{s.dob}</td>
                    <td className="py-2">{s.current_grade}</td>
                    <td className="py-2 text-indigo-600">{s.parent.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const input =
  "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
const primaryBtn =
  "w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors";

function Field({
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
