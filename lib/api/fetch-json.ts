export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  data?: T;
  error?: string;
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(input, { ...init, headers });
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  const envelope = body as ApiEnvelope<T>;
  if (!res.ok) {
    const msg =
      typeof envelope?.error === "string" && envelope.error.length > 0
        ? envelope.error
        : res.statusText || "Request failed";
    throw new ApiError(res.status, msg);
  }

  return envelope.data as T;
}
