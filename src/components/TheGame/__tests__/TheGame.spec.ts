import { describe, it, expect, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'

import { mount } from '@vue/test-utils'
import TheGame from '../TheGame.vue'
import { useGameStore } from '../../../stores/game/game'

describe('TheGame', () => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
  })

  const gameStore = useGameStore()
  gameStore.getPlayers = vi.fn(() => ['1', '2'])

  const wrapper = mount(TheGame, {
    props: { move: { size: 'small', mode: 'pawn' } },
    global: {
      plugins: [pinia],
    },
  })

  it('should render correctly', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should put pawn on the board', () => {
    const cell = wrapper.find('[data-test-id="cell-0-0"]')
    gameStore.state.currentPlayerId = '1'

    cell.trigger('click')

    expect(gameStore.putPawn).toHaveBeenCalledTimes(1)
    expect(gameStore.putPawn).toHaveBeenCalledWith({
      pawnSize: 'small',
      rowIndex: 0,
      columnIndex: 0,
    })
  })
})
