import { describe, it, expect, vi, beforeEach } from 'vitest'

beforeEach(() => {
  vi.resetAllMocks()
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token')
})

const API_URL = 'http://127.0.0.1:8000'

// mock import.meta.env
vi.stubEnv('VITE_API_URL', API_URL)

beforeEach(() => {
  vi.resetAllMocks()
  localStorage.getItem.mockReturnValue('mock-token')
})

describe('api.js - getRecipes', () => {
  it('calls correct endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: [], total_pages: 1 })
    })
    const { getRecipes } = await import('../../services/api.js')
    await getRecipes(1, 8)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/recipes?page=1&limit=8')
    )
  })

  it('returns data and total_pages', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: [{ recipe_id: 1 }], total_pages: 5 })
    })
    const { getRecipes } = await import('../../services/api.js')
    const result = await getRecipes(1, 8)
    expect(result.data).toHaveLength(1)
    expect(result.total_pages).toBe(5)
  })
})

describe('api.js - searchRecipes', () => {
  it('calls search endpoint with query', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ results: [], corrected_query: null })
    })
    const { searchRecipes } = await import('../../services/api.js')
    await searchRecipes('chicken')
    expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/search?q=chicken')
    )
  })

  it('encodes special characters in query', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ results: [] })
    })
    const { searchRecipes } = await import('../../services/api.js')
    await searchRecipes('chicken & rice')
    expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('chicken%20%26%20rice')
    )
  })
})

describe('api.js - auth endpoints', () => {
  it('login sends email and password', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ access_token: 'token123', token_type: 'bearer' })
    })
    const { login } = await import('../../services/api.js')
    const result = await login({ email: 'test@test.com', password: 'pass123' })
    expect(result.access_token).toBe('token123')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('register sends user data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ message: 'User created successfully' })
    })
    const { register } = await import('../../services/api.js')
    const result = await register({
      username: 'newuser',
      email: 'new@test.com',
      password: 'pass123'
    })
    expect(result.message).toBe('User created successfully')
  })
})

describe('api.js - folders', () => {
  it('getFolders sends auth header', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([])
    })
    const { getFolders } = await import('../../services/api.js')
    await getFolders()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/folders'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token'
        })
      })
    )
  })

  it('createFolder sends folder name', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ folder_id: 1, folder_name: 'Test' })
    })
    const { createFolder } = await import('../../services/api.js')
    const result = await createFolder('Test')
    expect(result.folder_name).toBe('Test')
  })

  it('deleteFolder calls correct endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ message: 'Folder deleted' })
    })
    const { deleteFolder } = await import('../../services/api.js')
    await deleteFolder(5)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/folders/5'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})

describe('api.js - bookmarks', () => {
  it('createBookmark sends recipe_id', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ bookmark_id: 1, recipe_id: 42 })
    })
    const { createBookmark } = await import('../../services/api.js')
    const result = await createBookmark({ recipe_id: 42, rating: 4 })
    expect(result.recipe_id).toBe(42)
  })

  it('deleteBookmark calls correct endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ message: 'Bookmark deleted' })
    })
    const { deleteBookmark } = await import('../../services/api.js')
    await deleteBookmark(3)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/bookmarks/3'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('getBookmarks sends sort param', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([])
    })
    const { getBookmarks } = await import('../../services/api.js')
    await getBookmarks('rating')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('sort=rating'),
      expect.any(Object)
    )
  })
})