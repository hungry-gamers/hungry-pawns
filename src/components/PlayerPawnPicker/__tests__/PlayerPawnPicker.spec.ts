import { describe, expect, it, vi } from 'vitest'
import PlayerPawnPicker from '../PlayerPawnPicker.vue'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useGameStore } from '../../../stores/game/game'

describe('PlayerPawnPicker', () => {
  const wrapper = mount(PlayerPawnPicker, {
    props: {
      playerId: '1',
    },
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
        }),
      ],
    },
  })

  it('should render properly', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should lock pawns', () => {
    wrapper.vm.pawns = { small: 2, medium: 4, big: 3 }
    wrapper.vm.$nextTick(() => {
      const button = wrapper.find('[data-test-id="lock-pawns-button"]')
      button.trigger('click')
      expect(useGameStore().lockPawns).toHaveBeenCalledTimes(1)
      expect(useGameStore().lockPawns).toHaveBeenCalledWith('1', { small: 2, medium: 4, big: 3 })
    })
  })
})
