// Types mirroring the SwaggerHub spec for The Finance Manager App (v1.0.0)

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface User extends UserSummary {
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = "income" | "expense";

export interface TransactionRequest {
  merchant: string;
  amount: number;
  category: string;
  type: TransactionType;
  date?: string;
  notes?: string;
  cardLastFour?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  merchant: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
  notes?: string;
  cardLastFour?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  limit?: number;
  color?: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  limit: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardRequest {
  name: string;
  last4: string;
  limit: number;
  statementDate: number;
}

export interface Card {
  id: string;
  userId: string;
  name: string;
  last4: string;
  limit: number;
  statementDate: number;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeRequest {
  merchant: string;
  amount: number;
  date?: string;
  category?: string;
  cardLastFour?: string;
  notes?: string;
}

export interface CategoryBreakdownItem {
  name: string;
  color: string;
  limit: number;
  spent: number;
}

export interface SummaryResponse {
  totalBalance: number;
  totalIncome: number;
  totalSpent: number;
  categoryBreakdown: CategoryBreakdownItem[];
}

export interface ErrorResponse {
  error: string;
}

export interface DeleteResponse {
  message: string;
}

// ── Frontend-only types ─────────────────────────────────────────────────

export interface NavItem {
  icon: string;
  label: string;
}

export type AddModalKind = "income" | "transaction" | "card" | "category";
export type SettingsModalKind = "budget" | "account";
export type AuthMode = "login" | "signup";
export type SortField = "date" | "amount";
export type SortDir = "asc" | "desc";
