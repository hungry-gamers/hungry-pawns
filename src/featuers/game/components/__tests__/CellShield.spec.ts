import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CellShield from '@/featuers/game/components/CellShield.vue'
import { createTestingPinia } from '@pinia/testing'
import { usePlayersStore } from '@/featuers/players/store/players.ts'

describe('CellShield', () => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
  })

  const playersStore = usePlayersStore()
  playersStore.getPlayers = vi.fn(() => ['1', '2'])

  it('should match snapshot for small', () => {
    const wrapper = mount(CellShield, {
      props: { ownerId: '1' },
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
