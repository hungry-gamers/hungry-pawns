import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import Board from '../Board.vue'

describe('Board', () => {
  const wrapper = mount(Board)

  it('renders properly', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })
})
