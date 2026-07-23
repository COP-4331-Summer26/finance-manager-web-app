import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  User,
  TransactionRequest,
  Transaction,
  CategoryRequest,
  Category,
  CardRequest,
  Card,
  IncomeRequest,
  SummaryResponse,
  DeleteResponse,
} from "../types";

// Defaults to the SwaggerHub auto-mock server, so the app is testable before
// your own Express backend implementing this spec exists. Point VITE_API_URL
// at your real backend once it's up (e.g. http://localhost:5000/api).
const BASE_URL: string =
  import.meta.env.VITE_API_URL || "https://virtserver.swaggerhub.com/ucf-e31/finance-manager-web-app/1.0.0";

// Persisted in localStorage so the session survives page refreshes and
// reopening the browser, until the user explicitly logs out or the JWT's
// own expiry (7 days) runs out — matching the pattern used in the course's
// reference MERN docs.
const TOKEN_KEY = "ucf_token";

// The backend's Mongoose responses include `_id`, not `id` — the schemas
// don't have the default `id` virtual turned on for JSON output (auth
// responses are the exception, since authController builds those by hand).
// This normalizes every response so the rest of the app can always rely on `.id`.
function withId<T extends { id?: string }>(obj: T & { _id?: string }): T & { id: string } {
  return { ...obj, id: obj.id ?? obj._id ?? "" };
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Thrown instead of a plain Error so callers can tell "wrong password" apart
// from "this account needs email verification" without parsing message text.
export class ApiError extends Error {
  status: number;
  requiresVerification?: boolean;
  email?: string;
  details?: string[];

  constructor(
    message: string,
    status: number,
    extra?: { requiresVerification?: boolean; email?: string; details?: string[] }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requiresVerification = extra?.requiresVerification;
    this.email = extra?.email;
    this.details = extra?.details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let requiresVerification: boolean | undefined;
    let email: string | undefined;
    let details: string[] | undefined;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
      requiresVerification = body?.requiresVerification;
      email = body?.email;
      details = body?.details;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new ApiError(message, res.status, { requiresVerification, email, details });
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface TransactionQuery {
  limit?: number;
  sort?: string;
  category?: string;
  start?: string;
  end?: string;
}

export const api = {
  // Auth
  register: (body: RegisterRequest) =>
    request<RegisterResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: LoginRequest) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  verifyEmail: (body: VerifyEmailRequest) =>
    request<AuthResponse>("/auth/verify-code", { method: "POST", body: JSON.stringify(body) }),

  resendVerification: (body: ResendVerificationRequest) =>
    request<DeleteResponse>("/auth/resend-code", { method: "POST", body: JSON.stringify(body) }),

  forgotPassword: (body: ForgotPasswordRequest) =>
    request<DeleteResponse>("/auth/forgot-password", { method: "POST", body: JSON.stringify(body) }),

  resetPassword: (body: ResetPasswordRequest) =>
    request<DeleteResponse>("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),

  getMe: () => request<User>("/users/me").then(withId),

  // Transactions
  getTransactions: (params: TransactionQuery = {}) => {
    const qs = new URLSearchParams();
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.sort) qs.set("sort", params.sort);
    if (params.category && params.category !== "All") qs.set("category", params.category);
    if (params.start) qs.set("start", params.start);
    if (params.end) qs.set("end", params.end);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<Transaction[]>(`/transactions${suffix}`).then((arr) => arr.map(withId));
  },

  addTransaction: (body: TransactionRequest) =>
    request<Transaction>("/transactions", { method: "POST", body: JSON.stringify(body) }).then(withId),

  editTransaction: (id: string, body: TransactionRequest) =>
    request<Transaction>(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(body) }).then(withId),

  deleteTransaction: (id: string) =>
    request<DeleteResponse>(`/transactions/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: () => request<Category[]>("/categories").then((arr) => arr.map(withId)),

  addCategory: (body: CategoryRequest) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(body) }).then(withId),

  editCategory: (id: string, body: CategoryRequest) =>
    request<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }).then(withId),

  deleteCategory: (id: string) =>
    request<DeleteResponse>(`/categories/${id}`, { method: "DELETE" }),

  // Cards
  getCards: () => request<Card[]>("/cards").then((arr) => arr.map(withId)),

  addCard: (body: CardRequest) =>
    request<Card>("/cards", { method: "POST", body: JSON.stringify(body) }).then(withId),

  editCard: (id: string, body: CardRequest) =>
    request<Card>(`/cards/${id}`, { method: "PUT", body: JSON.stringify(body) }).then(withId),

  deleteCard: (id: string) =>
    request<DeleteResponse>(`/cards/${id}`, { method: "DELETE" }),

  // Income
  addIncome: (body: IncomeRequest) =>
    request<Transaction>("/income", { method: "POST", body: JSON.stringify(body) }).then(withId),

  // Summary
  getSummary: (month: string) => request<SummaryResponse>(`/summary?month=${month}`),

  // Account
  deleteAccount: () => request<DeleteResponse>("/users/me", { method: "DELETE" }),
};
