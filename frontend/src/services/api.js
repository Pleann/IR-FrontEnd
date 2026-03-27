const API_URL = import.meta.env.VITE_API_URL;

export async function fetchTest() {
  const res = await fetch(`${API_URL}/`);
  return res.json();
}