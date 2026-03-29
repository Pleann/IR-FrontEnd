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

function authHeaders() {
  // console.log(localStorage.getItem("token"));
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  };
}

export async function getFolders() {
  const res = await fetch(`${API_URL}/folders`, { headers: authHeaders() });
  return res.json();
}

export async function createFolder(name) {
  const res = await fetch(`${API_URL}/folders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ folder_name: name })
  });
  return res.json();
}

export async function renameFolder(folderId, name) {
  const res = await fetch(`${API_URL}/folders/${folderId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ folder_name: name })
  });
  return res.json();
}

export async function deleteFolder(folderId) {
  const res = await fetch(`${API_URL}/folders/${folderId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return res.json();
}

export async function getBookmarks(sort = "rating") {
  const res = await fetch(`${API_URL}/bookmarks?sort=${sort}`, { headers: authHeaders() });
  return res.json();
}

export async function createBookmark(data) {
  const res = await fetch(`${API_URL}/bookmarks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateBookmark(bookmarkId, data) {
  const res = await fetch(`${API_URL}/bookmarks/${bookmarkId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteBookmark(bookmarkId) {
  const res = await fetch(`${API_URL}/bookmarks/${bookmarkId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return res.json();
}

export async function getFolderBookmarks(folderId) {
  const res = await fetch(`${API_URL}/folders/${folderId}/bookmarks`, { headers: authHeaders() });
  return res.json();
}

export async function getRecipeById(recipeId) {
  const res = await fetch(`${API_URL}/recipes/${recipeId}`, { headers: authHeaders() });
  return res.json();
}