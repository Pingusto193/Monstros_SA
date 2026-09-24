/**
 * Objetos de contexto e seus tipos. Os Providers ficam em arquivos .tsx separados
 * e os hooks de acesso em src/hooks (useAuth, useTheme, useToast).
 */
import { createContext } from 'react';
import type { CurrentUser, LoginInput, RegisterInput } from '@/types';

// ---------- Autenticação ----------

export type AuthStatus = 'checking' | 'authenticated' | 'guest';

export interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  /** true quando o usuário saiu por conta própria (não volta para a última página ao entrar). */
  loggedOutByUser: boolean;
  login(input: LoginInput): Promise<CurrentUser>;
  register(input: RegisterInput): Promise<CurrentUser>;
  logout(options?: { silent?: boolean }): Promise<void>;
  updateUser(user: CurrentUser): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// ---------- Tema ----------

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference(preference: ThemePreference): void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

// ---------- Toasts ----------

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  tone: ToastTone;
  message: string;
}

export interface ToastApi {
  show(message: string, tone?: ToastTone): string;
  success(message: string): string;
  error(message: string): string;
  info(message: string): string;
  dismiss(id: string): void;
}

export const ToastContext = createContext<ToastApi | null>(null);
