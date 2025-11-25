import { BACKEND_BASE_URL } from "@/config";
import * as SecureStore from "expo-secure-store";

type RegisterResponse = { access_token: string };

export async function registerTestUser(): Promise<string> {
  // Reuse an existing token if present to avoid creating many test users
  try {
    const existing = await SecureStore.getItemAsync("jwt");
    if (existing) return existing;
  } catch {
    // ignore secure store read errors and continue to register
  }

  const url = `${BACKEND_BASE_URL}/auth/email/register`;
  const payload = {
    email: `mobile-test+${Date.now()}@example.com`,
    name: "Mobile Tester",
    password: "password123",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Register failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as RegisterResponse;
  try {
    await SecureStore.setItemAsync("jwt", data.access_token);
  } catch (e) {
    // if secure store fails, continue returning token
    console.warn("Failed to save JWT to SecureStore", e);
  }

  return data.access_token;
}

export async function getTodaysReminders(token: string): Promise<any[]> {
  const url = `${BACKEND_BASE_URL}/reminders/today`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch reminders failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data as any[];
}

export async function getProgressSummary(token: string): Promise<any> {
  const url = `${BACKEND_BASE_URL}/reminders/summary`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch progress summary failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data;
}

export async function getStreak(token: string): Promise<any> {
  const url = `${BACKEND_BASE_URL}/reminders/streak`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch streak failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data;
}

export default {
  registerTestUser,
  getTodaysReminders,
  getProgressSummary,
  getStreak,
};
