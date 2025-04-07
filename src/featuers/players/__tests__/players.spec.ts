import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayersStore } from '@/featuers/players/store/players.ts'
import { players } from '@/featuers/players/utils/mocks.ts'

const player = {
  pawns: {
    big: 3,
    medium: 3,
    small: 3,
  },
  capturedPawnsCounter: 0,
  arePawnsLocked: false,
  specialMoves: ['shield', 'drop'],
}

describe('players.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const { createPlayers } = usePlayersStore()

    createPlayers(players)
  })

  it('should create the players', () => {
    const { state } = usePlayersStore()

    expect(state).toEqual({
      players: {
        '1': player,
        '2': player,
      },
      pawnsStatus: 'picking',
    })
  })

  it('should lock pawns for player', () => {
    const { lockPawns, state } = usePlayersStore()

    const resultPlayer1 = lockPawns('1', { small: 3, medium: 3, big: 3 })
    expect(state.players[1].pawns).toEqual({ small: 3, medium: 3, big: 3 })
    expect(state.players[1].arePawnsLocked).toBe(true)
    expect(resultPlayer1).toBe(false)

    const resultPlayer2 = lockPawns('2', { small: 3, medium: 3, big: 3 })

    expect(state.players[2].pawns).toEqual({ small: 3, medium: 3, big: 3 })
    expect(state.players[2].arePawnsLocked).toBe(true)
    expect(resultPlayer2).toBe(true)
  })

  it('should return players ids', () => {
    const { getPlayers } = usePlayersStore()

    expect(getPlayers()).toEqual(['1', '2'])
  })

  it('should increase/decrease pawns amount depends on value', () => {
    const { manipulatePawnAmount, lockPawns, state } = usePlayersStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    manipulatePawnAmount('1', 'small', 2)
    manipulatePawnAmount('2', 'small', -2)
    expect(state.players[1].pawns.small).toBe(5)
    expect(state.players[2].pawns.small).toBe(1)
  })

  it('should use special move', () => {
    const { useSpecialMove, state } = usePlayersStore()

    useSpecialMove('1', 'shield')

    expect(state.players[1].specialMoves.includes('shield')).toBe(false)
  })
})
