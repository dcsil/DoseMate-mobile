import { BACKEND_BASE_URL } from "../../config";

// Backend returns UUIDs as strings and numeric value (float) + optional int_value.
export type ProgressEntry = {
  id: string; // UUID
  user_id: string; // UUID
  metric_name: string;
  value: number; // always numeric per backend
  int_value: number | null;
  created_at: string; // ISO timestamp
};

interface CreateProgressInput {
  metric_name: string;
  value?: number; // optional convenience
  int_value?: number; // optional
}

// Normalize payload: backend requires value; if omitted but int_value present use int_value.
function normalizeCreatePayload(data: CreateProgressInput): {
  metric_name: string;
  value: number;
  int_value: number | null;
} {
  const { metric_name, value, int_value } = data;
  if (value == null) {
    if (int_value == null) {
      throw new Error("value or int_value is required");
    }
    return { metric_name, value: int_value, int_value };
  }
  return { metric_name, value, int_value: int_value ?? null };
}

// Create a new progress entry for a user
export async function createProgress(
  userId: string,
  data: CreateProgressInput,
): Promise<ProgressEntry> {
  const payload = normalizeCreatePayload(data);
  const resp = await fetch(`${BACKEND_BASE_URL}/users/${userId}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`createProgress failed (${resp.status}): ${text}`);
  }
  return resp.json();
}

// List all progress entries for a user
export async function listProgress(
  userId: string,
  opts?: { metric_name?: string; limit?: number },
): Promise<ProgressEntry[]> {
  const params = new URLSearchParams();
  if (opts?.metric_name) params.append("metric_name", opts.metric_name);
  if (opts?.limit) params.append("limit", String(opts.limit));
  const query = params.toString();
  const resp = await fetch(
    `${BACKEND_BASE_URL}/users/${userId}/progress${query ? `?${query}` : ""}`,
  );
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`listProgress failed (${resp.status}): ${text}`);
  }
  return resp.json();
}

// Convenience: get latest entry for a metric (backend already sorts desc)
export async function getLatestProgress(
  userId: string,
  metricName: string,
): Promise<ProgressEntry | null> {
  const entries = await listProgress(userId, {
    metric_name: metricName,
    limit: 1,
  });
  return entries[0] ?? null;
}
