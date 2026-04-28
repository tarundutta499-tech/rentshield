export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:5179";
}

export async function apiPost(path, body) {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {})
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const msg = errorData?.error || errorData?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  
  const data = await res.json();
  return data;
}

