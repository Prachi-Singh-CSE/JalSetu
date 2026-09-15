const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
}

export function apiGet(path) {
  return request(path);
}

export function apiPatch(path, body) {
  return request(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}
