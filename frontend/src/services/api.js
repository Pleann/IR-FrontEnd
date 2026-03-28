const API_URL = import.meta.env.VITE_API_URL;

export async function getRecipes(page = 1, limit = 16) {
  const res = await fetch(`${API_URL}/recipes?page=${page}&limit=${limit}`);
  return res.json();
}

export async function register(data) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function login(data) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function searchRecipes(query) {
  const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
  return res.json();
}