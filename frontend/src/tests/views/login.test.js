import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('../../services/api.js', () => ({
  login: vi.fn()
}))

import { login } from '../../services/api.js'
import Login from '../../views/Login.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div/>' } },
    { path: '/login', component: Login },
    { path: '/register', component: { template: '<div/>' } },
  ]
})

describe('Login.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
    vi.spyOn(Storage.prototype, 'setItem')   // 👈 ADD THIS
    })

  it('renders email and password inputs', () => {
    const wrapper = mount(Login, { global: { plugins: [router] } })
    expect(wrapper.find('input[type="email"], input[placeholder*="email" i]').exists() ||
           wrapper.findAll('input').length >= 2).toBe(true)
  })

  it('calls login on form submit', async () => {
    login.mockResolvedValue({ access_token: 'token123' })
    const wrapper = mount(Login, { global: { plugins: [router] } })
    const inputs = wrapper.findAll('input')
    if (inputs.length >= 2) {
      await inputs[0].setValue('test@test.com')
      await inputs[1].setValue('password123')
    }
    await wrapper.find('button').trigger('click')
    expect(login).toHaveBeenCalled()
  })

  it('stores token on successful login', async () => {
    login.mockResolvedValue({ access_token: 'token123' })
    const wrapper = mount(Login, { global: { plugins: [router] } })
    const inputs = wrapper.findAll('input')
    if (inputs.length >= 2) {
      await inputs[0].setValue('test@test.com')
      await inputs[1].setValue('password123')
    }
    await wrapper.find('button').trigger('click')
    await new Promise(r => setTimeout(r, 50))
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'token123')
  })
})