"use client";

import { useEffect, useState, useCallback } from "react";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Generic client-side fetch hook.
 * `url` should be null/undefined to skip fetching.
 */
export function useApi<T>(url: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>(url ? "loading" : "idle");
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!url) {
      setData(null);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json() as Promise<T>;
      })
      .then((json) => {
        setData(json);
        setStatus("success");
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setStatus("error");
      });
  }, [url]);

  useEffect(() => {
    refetch();
  }, deps);

  return { data, status, error, isLoading: status === "loading", refetch };
}

/** POST helper returning { ok, data, error } */
export async function postJSON<T>(url: string, body: unknown): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as T & { error?: string };
    if (!res.ok) return { ok: false, error: (json as { error?: string }).error ?? `Request failed (${res.status})` };
    return { ok: true, data: json };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}
