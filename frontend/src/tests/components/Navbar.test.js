import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Navbar from '../../components/Navbar.vue'

beforeEach(() => {
  vi.resetAllMocks()
  vi.spyOn(Storage.prototype, 'removeItem')
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div/>' } },
    { path: '/folders', component: { template: '<div/>' } },
    { path: '/bookmarks', component: { template: '<div/>' } },
    { path: '/register', component: { template: '<div/>' } },
    { path: '/login', component: { template: '<div/>' } },
  ]
})

describe('Navbar', () => {
  it('renders app name', () => {
    const wrapper = mount(Navbar, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('RECIPE')
  })

  it('renders search input', () => {
    const wrapper = mount(Navbar, { global: { plugins: [router] } })
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
  })

  it('emits search event on button click', async () => {
    const wrapper = mount(Navbar, { global: { plugins: [router] } })
    const input = wrapper.find('input')
    await input.setValue('chicken')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0][0]).toBe('chicken')
  })

  it('emits search event on enter key', async () => {
    const wrapper = mount(Navbar, { global: { plugins: [router] } })
    const input = wrapper.find('input')
    await input.setValue('pasta')
    await input.trigger('keyup.enter')
    expect(wrapper.emitted('search')).toBeTruthy()
  })

  it('emits trimmed search query', async () => {
    const wrapper = mount(Navbar, { global: { plugins: [router] } })
    const input = wrapper.find('input')
    await input.setValue('  cake  ')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('search')[0][0]).toBe('cake')
  })

  it('renders logout button', () => {
    const wrapper = mount(Navbar, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Logout')
  })

  it('clears localStorage on logout', async () => {
    const wrapper = mount(Navbar, { global: { plugins: [router] } })
    const logoutBtn = wrapper.findAll('button').find(b => b.text() === 'Logout')
    await logoutBtn.trigger('click')
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
  })
})