import { describe, expect, it, vi } from 'vitest'
import PlayerPawnPicker from '../PlayerPawnPicker.vue'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useGameStore } from '@/featuers/game/store/game.ts'
import { players } from '@/utils/mocks/game.ts'

describe('PlayerPawnPicker', () => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
  })

  const store = useGameStore()
  const spy = vi.spyOn(store, 'lockPawns')
  store.initiateGame(players)

  const wrapper = mount(PlayerPawnPicker, {
    props: {
      playerId: '1',
    },
    global: {
      plugins: [pinia],
    },
  })

  it('should render properly', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should lock pawns', async () => {
    const button = wrapper.find('[data-test-id="lock-pawns-button"]')
    await button.trigger('click')

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('1', { small: 3, medium: 3, big: 3 })
  })
})
