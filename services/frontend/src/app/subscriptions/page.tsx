"use client";

import { useEffect, useState } from "react";
import {
  createSubscription,
  listParents,
  listStudents,
  listSubscriptions,
  type Parent,
  type Student,
  type Subscription,
} from "@/lib/api";

const today = new Date().toISOString().split("T")[0];
const oneYear = new Date(Date.now() + 365 * 86400_000).toISOString().split("T")[0];

const PACKAGES = [
  { label: "Gói 10 buổi", sessions: 10 },
  { label: "Gói 20 buổi", sessions: 20 },
  { label: "Gói 30 buổi", sessions: 30 },
];

const EMPTY_FORM = {
  student_id: 0,
  package_name: PACKAGES[0].label,
  start_date: today,
  end_date: oneYear,
  total_sessions: PACKAGES[0].sessions,
  used_sessions: 0,
};

function statusBadge(sub: Subscription) {
  const now = today;
  const expired = sub.end_date < now;
  const exhausted = sub.remaining_sessions <= 0;
  if (expired) return { label: "Hết hạn", cls: "bg-red-100 text-red-700" };
  if (exhausted) return { label: "Hết buổi", cls: "bg-orange-100 text-orange-700" };
  return { label: "Đang hiệu lực", cls: "bg-green-100 text-green-700" };
}

export default function SubscriptionsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | "">("");
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Students belonging to selected parent
  const parentStudents =
    selectedParentId !== ""
      ? students.filter((s) => s.parent_id === selectedParentId)
      : students;

  // Load parents + students once
  useEffect(() => {
    listParents().then(setParents).catch(() => {});
    listStudents().then(setStudents).catch(() => {});
  }, []);

  // Reload subscriptions when the selected student changes
  useEffect(() => {
    if (form.student_id) {
      listSubscriptions(form.student_id).then(setSubs).catch(() => {});
    } else {
      setSubs([]);
    }
  }, [form.student_id]);

  // When parent picked, auto-select first child
  function pickParent(pid: number | "") {
    setSelectedParentId(pid);
    if (pid === "") {
      setForm({ ...form, student_id: 0 });
    } else {
      const first = students.find((s) => s.parent_id === pid);
      setForm({ ...form, student_id: first?.id ?? 0 });
    }
  }

  function pickPackage(label: string) {
    const pkg = PACKAGES.find((p) => p.label === label) ?? PACKAGES[0];
    setForm({ ...form, package_name: pkg.label, total_sessions: pkg.sessions });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id) {
      setError("Vui lòng chọn học sinh.");
      return;
    }
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await createSubscription(form);
      setSuccess("Đăng ký gói học thành công!");
      setShowForm(false);
      // Refresh list
      const updated = await listSubscriptions(form.student_id);
      setSubs(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gói học (Subscriptions)</h1>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setError("");
            setSuccess("");
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {showForm ? "Ẩn form" : "+ Đăng ký gói học"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* ── Register form ────────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Đăng ký gói học mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Phụ huynh" required>
                <select
                  value={selectedParentId}
                  onChange={(e) =>
                    pickParent(e.target.value ? Number(e.target.value) : "")
                  }
                  className={input}
                >
                  <option value="">-- chọn phụ huynh --</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.phone}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Học sinh" required>
                {parentStudents.length === 0 ? (
                  <p className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    {selectedParentId
                      ? "Phụ huynh này chưa có học sinh nào."
                      : "Chọn phụ huynh để lọc học sinh."}
                  </p>
                ) : (
                  <select
                    required
                    value={form.student_id || ""}
                    onChange={(e) =>
                      setForm({ ...form, student_id: Number(e.target.value) })
                    }
                    className={input}
                  >
                    <option value="">-- chọn học sinh --</option>
                    {parentStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — Lớp {s.current_grade}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <Field label="Gói học" required>
                <select
                  value={form.package_name}
                  onChange={(e) => pickPackage(e.target.value)}
                  className={input}
                >
                  {PACKAGES.map((p) => (
                    <option key={p.label} value={p.label}>
                      {p.label} ({p.sessions} buổi)
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Ngày bắt đầu" required>
                  <input
                    required
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                    className={input}
                  />
                </Field>
                <Field label="Ngày hết hạn" required>
                  <input
                    required
                    type="date"
                    value={form.end_date}
                    min={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, end_date: e.target.value })
                    }
                    className={input}
                  />
                </Field>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm">
                <p className="text-indigo-700 font-medium">
                  📦 {form.package_name} — {form.total_sessions} buổi học
                </p>
                <p className="text-indigo-500 text-xs mt-0.5">
                  Từ {form.start_date} đến {form.end_date}
                </p>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Đang đăng ký…" : "Đăng ký gói học"}
              </button>
            </form>
          </div>
        )}

        {/* ── Filter + subscription list ───────────────────────────────── */}
        <div className={`bg-white rounded-xl shadow p-6 ${!showForm ? "md:col-span-2" : ""}`}>
          <div className="flex flex-wrap gap-3 mb-4 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium mb-1">
                Lọc theo phụ huynh
              </label>
              <select
                value={selectedParentId}
                onChange={(e) =>
                  pickParent(e.target.value ? Number(e.target.value) : "")
                }
                className={input}
              >
                <option value="">-- tất cả --</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium mb-1">
                Lọc theo học sinh
              </label>
              <select
                value={form.student_id || ""}
                onChange={(e) =>
                  setForm({ ...form, student_id: Number(e.target.value) })
                }
                className={input}
              >
                <option value="">-- tất cả học sinh --</option>
                {parentStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Lớp {s.current_grade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="text-base font-semibold mb-3">
            Danh sách gói học
            {form.student_id
              ? ` — ${students.find((s) => s.id === form.student_id)?.name}`
              : ""}
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({subs.length})
            </span>
          </h2>

          {!form.student_id ? (
            <p className="text-gray-400 text-sm">
              Chọn học sinh để xem danh sách gói học.
            </p>
          ) : subs.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Học sinh này chưa có gói học nào.
            </p>
          ) : (
            <div className="space-y-3">
              {subs.map((sub) => {
                const badge = statusBadge(sub);
                const pct =
                  sub.total_sessions > 0
                    ? Math.round((sub.used_sessions / sub.total_sessions) * 100)
                    : 0;
                return (
                  <div
                    key={sub.id}
                    className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm">{sub.package_name}</p>
                        <p className="text-xs text-gray-400">
                          {sub.start_date} → {sub.end_date}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Session progress bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>
                          Đã dùng: {sub.used_sessions} / {sub.total_sessions} buổi
                        </span>
                        <span className="font-medium text-indigo-600">
                          Còn lại: {sub.remaining_sessions}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── tiny bits ─────────────────────────────────────────────────────────────────

const input =
  "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

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
