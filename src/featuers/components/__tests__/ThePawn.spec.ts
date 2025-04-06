import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ThePawn from '@/featuers/components/ThePawn.vue'

describe('The Pawn', () => {
  it('should match snapshot for small', () => {
    const wrapper = mount(ThePawn, {
      props: { size: 'small', color: 'red' },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should match snapshot for medium', () => {
    const wrapper = mount(ThePawn, {
      props: { size: 'medium', color: 'red' },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should match snapshot for big', () => {
    const wrapper = mount(ThePawn, {
      props: { size: 'big', color: 'red' },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
