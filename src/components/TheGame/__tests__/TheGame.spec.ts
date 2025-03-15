import { describe, it, expect, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'

import { mount } from '@vue/test-utils'
import Board from '../TheGame.vue'
import { useGameStore } from '../../../stores/game/game'

describe('Game', () => {
  const wrapper = mount(Board, {
    props: { pawnSize: 'small' },
    global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
  })

  it('should render correctly', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should put pawn on the board', () => {
    const gameStore = useGameStore()
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
