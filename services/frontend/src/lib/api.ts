const BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Parent {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface Student {
  id: number;
  name: string;
  dob: string;
  gender: "male" | "female" | "other";
  current_grade: string;
  parent_id: number;
  parent: Parent;
}

export interface Class {
  id: number;
  name: string;
  subject: string;
  day_of_week: string;
  time_slot: string;
  teacher_name: string;
  max_students: number;
}

export interface Subscription {
  id: number;
  student_id: number;
  package_name: string;
  start_date: string;
  end_date: string;
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
}

export interface Registration {
  id: number;
  class_id: number;
  student_id: number;
  registered_at: string;
}

// ── Shared fetch helper ────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const msg = Array.isArray(err.detail)
      ? err.detail.map((e: { msg: string }) => e.msg).join(", ")
      : (err.detail ?? "Request failed");
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ── Parents ────────────────────────────────────────────────────────────────

export const listParents = () => apiFetch<Parent[]>("/api/parents");

export const createParent = (data: Omit<Parent, "id">) =>
  apiFetch<Parent>("/api/parents", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ── Students ───────────────────────────────────────────────────────────────

export const listStudents = () => apiFetch<Student[]>("/api/students");

export const createStudent = (
  data: Omit<Student, "id" | "parent">
) =>
  apiFetch<Student>("/api/students", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ── Classes ────────────────────────────────────────────────────────────────

export const listClasses = (day?: string) =>
  apiFetch<Class[]>(`/api/classes${day ? `?day=${encodeURIComponent(day)}` : ""}`);

export const createClass = (data: Omit<Class, "id">) =>
  apiFetch<Class>("/api/classes", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ── Registrations ──────────────────────────────────────────────────────────

export const registerStudent = (classId: number, studentId: number) =>
  apiFetch<Registration>(`/api/classes/${classId}/register`, {
    method: "POST",
    body: JSON.stringify({ student_id: studentId }),
  });

// ── Subscriptions ──────────────────────────────────────────────────────────

export const createSubscription = (
  data: Omit<Subscription, "id" | "remaining_sessions">
) =>
  apiFetch<Subscription>("/api/subscriptions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const listSubscriptions = (studentId?: number) =>
  apiFetch<Subscription[]>(
    `/api/subscriptions${studentId ? `?student_id=${studentId}` : ""}`
  );

export const getSubscription = (id: number) =>
  apiFetch<Subscription>(`/api/subscriptions/${id}`);
