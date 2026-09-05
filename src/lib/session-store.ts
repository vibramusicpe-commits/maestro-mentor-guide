/**
 * ================================================================
 * session-store.ts — Capa de Idempotencia y Sesión Efímera
 * ================================================================
 * ADR-001 §2.3 & Plan Maestro Fase 2
 *
 * Implementa Upstash Redis (REST HTTP) con fallback en memoria (LRU)
 * para desarrollo local y entornos sin credenciales Upstash configuradas.
 * ================================================================
 */

import { Redis } from "@upstash/redis";

export interface SessionMessage {
  role: "user" | "model";
  text: string;
}

export interface SessionStore {
  isMessageNew(messageId: string, ttlSeconds?: number): Promise<boolean>;
  getSessionHistory(phone: string): Promise<SessionMessage[]>;
  appendSessionMessage(
    phone: string,
    role: "user" | "model",
    text: string,
    ttlSeconds?: number
  ): Promise<void>;
  clearSession(phone: string): Promise<void>;
}

// ----------------------------------------------------------------
// 1. Fallback en Memoria (Local Dev & Tests)
// ----------------------------------------------------------------
interface MemoryEntry<T> {
  value: T;
  expiresAt: number;
}

class InMemorySessionStore implements SessionStore {
  private idCache = new Map<string, number>();
  private sessionCache = new Map<string, MemoryEntry<SessionMessage[]>>();

  async isMessageNew(messageId: string, ttlSeconds: number = 86400): Promise<boolean> {
    const now = Date.now();
    this.cleanExpired();

    const existingExpiry = this.idCache.get(messageId);
    if (existingExpiry && existingExpiry > now) {
      return false; // Ya fue procesado
    }

    this.idCache.set(messageId, now + ttlSeconds * 1000);
    return true; // Es nuevo
  }

  async getSessionHistory(phone: string): Promise<SessionMessage[]> {
    const now = Date.now();
    const entry = this.sessionCache.get(phone);
    if (!entry || entry.expiresAt <= now) {
      this.sessionCache.delete(phone);
      return [];
    }
    return entry.value;
  }

  async appendSessionMessage(
    phone: string,
    role: "user" | "model",
    text: string,
    ttlSeconds: number = 1800
  ): Promise<void> {
    const now = Date.now();
    const history = await this.getSessionHistory(phone);
    history.push({ role, text });
    // Mantener solo los últimos 6 turnos (ADR-001)
    const trimmed = history.slice(-6);

    this.sessionCache.set(phone, {
      value: trimmed,
      expiresAt: now + ttlSeconds * 1000,
    });
  }

  async clearSession(phone: string): Promise<void> {
    this.sessionCache.delete(phone);
  }

  private cleanExpired() {
    const now = Date.now();
    for (const [id, exp] of this.idCache.entries()) {
      if (exp <= now) this.idCache.delete(id);
    }
  }
}

// ----------------------------------------------------------------
// 2. Implementación Upstash Redis (Producción en Cloudflare Pages)
// ----------------------------------------------------------------
class UpstashSessionStore implements SessionStore {
  private redis: Redis;

  constructor(url: string, token: string) {
    this.redis = new Redis({ url, token });
  }

  async isMessageNew(messageId: string, ttlSeconds: number = 86400): Promise<boolean> {
    const key = `wa:msg:${messageId}`;
    // SET NX: solo setea si NO existe. Retorna "OK" si es nuevo, o null si ya existía.
    const result = await this.redis.set(key, 1, { nx: true, ex: ttlSeconds });
    return result === "OK";
  }

  async getSessionHistory(phone: string): Promise<SessionMessage[]> {
    const key = `wa:session:${phone}`;
    const data = await this.redis.get<SessionMessage[]>(key);
    return data || [];
  }

  async appendSessionMessage(
    phone: string,
    role: "user" | "model",
    text: string,
    ttlSeconds: number = 1800
  ): Promise<void> {
    const key = `wa:session:${phone}`;
    const history = await this.getSessionHistory(phone);
    history.push({ role, text });
    const trimmed = history.slice(-6);
    await this.redis.set(key, trimmed, { ex: ttlSeconds });
  }

  async clearSession(phone: string): Promise<void> {
    const key = `wa:session:${phone}`;
    await this.redis.del(key);
  }
}

// ----------------------------------------------------------------
// 3. Fábrica Singleton
// ----------------------------------------------------------------
function createSessionStore(): SessionStore {
  const envUrl = typeof process !== "undefined" && process.env ? process.env.UPSTASH_REDIS_REST_URL : undefined;
  const envToken = typeof process !== "undefined" && process.env ? process.env.UPSTASH_REDIS_REST_TOKEN : undefined;
  
  const viteUrl = (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_UPSTASH_REDIS_REST_URL;
  const viteToken = (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_UPSTASH_REDIS_REST_TOKEN;

  const url = envUrl || viteUrl;
  const token = envToken || viteToken;

  if (url && token) {
    return new UpstashSessionStore(url, token);
  }
  return new InMemorySessionStore();
}

export const sessionStore = createSessionStore();
