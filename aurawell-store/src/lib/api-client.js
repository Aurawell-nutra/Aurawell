// Small fetch wrapper for the browser. Returns parsed JSON or throws an ApiError
// carrying the server's safe message and field errors.
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.fields = data?.fields ?? {};
    this.data = data;
  }
}

export async function apiFetch(url, { method = "GET", body, headers, csrfToken } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      ...(body !== undefined && !(body instanceof FormData) && { "Content-Type": "application/json" }),
      ...(csrfToken && { "x-csrf-token": csrfToken }),
      ...headers,
    },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Something went wrong. Please try again.", res.status, data);
  return data;
}
