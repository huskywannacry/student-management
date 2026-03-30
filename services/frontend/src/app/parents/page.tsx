"use client";

import { useEffect, useState } from "react";
import { createParent, listParents, type Parent } from "@/lib/api";

const EMPTY = { name: "", phone: "", email: "" };

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () =>
    listParents()
      .then(setParents)
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await createParent(form);
      setSuccess("Parent created successfully!");
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
      <h1 className="text-2xl font-bold mb-6">Parents</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ── Create form ── */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add Parent</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name" required>
              <input
                required
                placeholder="Nguyen Van A"
                value={form.name}
                onChange={set("name")}
                className={input}
              />
            </Field>

            <Field label="Phone" required>
              <input
                required
                placeholder="0901234567"
                value={form.phone}
                onChange={set("phone")}
                className={input}
              />
            </Field>

            <Field label="Email" required>
              <input
                required
                type="email"
                placeholder="parent@example.com"
                value={form.email}
                onChange={set("email")}
                className={input}
              />
            </Field>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? "Creating…" : "Create Parent"}
            </button>
          </form>
        </div>

        {/* ── List ── */}
        <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">
            Parent List{" "}
            <span className="text-sm font-normal text-gray-400">
              ({parents.length})
            </span>
          </h2>
          {parents.length === 0 ? (
            <p className="text-gray-400 text-sm">No parents yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b text-gray-500">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Phone</th>
                  <th className="pb-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 text-gray-400">{p.id}</td>
                    <td className="py-2 font-medium">{p.name}</td>
                    <td className="py-2">{p.phone}</td>
                    <td className="py-2">{p.email}</td>
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

// ── tiny reusable bits ───────────────────────────────────────────────────────

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
