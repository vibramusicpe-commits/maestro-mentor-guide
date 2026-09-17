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
    if (session.token && !session.token.startsWith("eyJ")) {
      session.token = INSFORGE_CONFIG.anonKey;
    }
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
  
  const knownIds: Record<string, string> = {
    "duena@vibramusic.pe": "00000000-0000-0000-0000-000000000001",
    "dueña@vibramusic.pe": "00000000-0000-0000-0000-000000000001",
    "sergio@vibramusic.pe": "00000000-0000-0000-0000-000000000007",
    "nayeli@vibramusic.pe": "00000000-0000-0000-0000-000000000002",
    "jeremy@vibramusic.pe": "00000000-0000-0000-0000-000000000003",
    "fernando@vibramusic.pe": "00000000-0000-0000-0000-000000000004",
    "nathaly@vibramusic.pe": "00000000-0000-0000-0000-000000000005",
    "demo@vibramusic.pe": "00000000-0000-0000-0000-000000000006",
  };

  const userId = knownIds[email.toLowerCase()] || `usr-${Math.random().toString(36).slice(2, 9)}`;

  const mockUser: UserSession = {
    id: userId,
    email,
    full_name:
      email.toLowerCase().includes("sergio")
        ? "Sergio (Dirección)"
        : email.toLowerCase().includes("fabricio")
        ? "Fabricio (Marketing)"
        : email.toLowerCase().includes("karla")
        ? "Karla (Secretaría)"
        : email.toLowerCase().includes("fernando")
        ? "Fernando (Violín y Piano)"
        : email.toLowerCase().includes("nathaly")
        ? "Nathaly (Canto y Piano Infantil)"
        : email.toLowerCase().includes("jeremy")
        ? "Jeremy (Guitarra y Batería)"
        : role === "super_admin"
        ? "Rocío (Dueña)"
        : role === "staff"
        ? "Nayeli (Secretaría)"
        : role === "teacher"
        ? "Profesor/a Vibra"
        : "Familia Vibra",
    role,
    token: INSFORGE_CONFIG.anonKey,
  };

  saveStoredSession(mockUser);
  return mockUser;
}

export function logoutUser(): void {
  saveStoredSession(null);
}
