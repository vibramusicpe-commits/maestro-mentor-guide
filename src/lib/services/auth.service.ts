/**
 * auth.service.ts — Servicio de Autenticación de Insforge (OAuth / Email Passwordless)
 */

import { INSFORGE_CONFIG, setSessionToken } from "../insforge";
import type { Role } from "@/store/app-store";

export interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  token: string;
}

// Claves de almacenamiento local para persistencia de sesión
const SESSION_KEY = "cadencia_auth_session";

export function getStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as UserSession;
    setSessionToken(session.token);
    return session;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: UserSession | null): void {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    setSessionToken(null);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setSessionToken(session.token);
  }
}

/**
 * Simulación / Conexión de inicio de sesión por Email o OAuth con Insforge
 */
export async function loginWithCredentials(
  email: string,
  role: Role,
): Promise<UserSession> {
  // Cuando la API Auth de Insforge esté completamente vinculada
  // se llamará a INSFORGE_CONFIG.baseUrl + "/auth/login"
  
  const mockUser: UserSession = {
    id: `usr-${Math.random().toString(36).slice(2, 9)}`,
    email,
    full_name:
      role === "super_admin"
        ? "Dirección General (Dueña)"
        : role === "staff"
        ? "Nayeli (Secretaría)"
        : role === "teacher"
        ? "Profesor/a Vibra"
        : "Familia Vibra",
    role,
    token: `jwt-token-${role}-${Date.now()}`,
  };

  saveStoredSession(mockUser);
  return mockUser;
}

export function logoutUser(): void {
  saveStoredSession(null);
}
