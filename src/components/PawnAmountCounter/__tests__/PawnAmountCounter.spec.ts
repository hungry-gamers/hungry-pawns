import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PawnAmountCounter from '../PawnAmountCounter.vue'

describe('PawnAmountCounter', () => {
  const wrapper = mount(PawnAmountCounter, {
    props: {
      size: 'small',
      amount: 2,
      isIncreaseDisabled: false,
    },
  })

  beforeEach(() => vi.clearAllMocks())

  it('should render properly', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should emit decrease event', () => {
    const button = wrapper.find('[data-test-id="decrease-button"]')
    button.trigger('click')
    expect(wrapper.emitted()['on-amount-changed']).toContainEqual([
      {
        amount: 1,
        size: 'small',
      },
    ])
  })

  it('should emit increase event', () => {
    const button = wrapper.find('[data-test-id="increase-button"]')
    button.trigger('click')
    expect(wrapper.emitted()['on-amount-changed']).toContainEqual([
      {
        amount: 3,
        size: 'small',
      },
    ])
  })
})
