import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DishCard from '../components/DishCard.vue'

const defaultProps = {
  title: 'Chocolate Cake',
  image: 'http://example.com/cake.jpg',
  description: 'A delicious chocolate cake',
  category: 'Desserts',
  recipe: { recipe_id: 1, name: 'Chocolate Cake' }
}

describe('DishCard', () => {
  it('renders title correctly', () => {
    const wrapper = mount(DishCard, { props: defaultProps })
    expect(wrapper.text()).toContain('Chocolate Cake')
  })

  it('renders category', () => {
    const wrapper = mount(DishCard, { props: defaultProps })
    expect(wrapper.text()).toContain('Desserts')
  })

  it('renders description', () => {
    const wrapper = mount(DishCard, { props: defaultProps })
    expect(wrapper.text()).toContain('A delicious chocolate cake')
  })

  it('renders image with correct src', () => {
    const wrapper = mount(DishCard, { props: defaultProps })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('http://example.com/cake.jpg')
  })

  it('emits select event when clicked', async () => {
    const wrapper = mount(DishCard, { props: defaultProps })
    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('emits select with recipe object', async () => {
    const wrapper = mount(DishCard, { props: defaultProps })
    await wrapper.trigger('click')
    const emitted = wrapper.emitted('select')
    expect(emitted[0][0]).toEqual(defaultProps.recipe)
  })

  it('renders without image gracefully', () => {
    const wrapper = mount(DishCard, {
      props: { ...defaultProps, image: '' }
    })
    expect(wrapper.exists()).toBe(true)
  })
})