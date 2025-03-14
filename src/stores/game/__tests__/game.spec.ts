import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../game'
import { players } from '../../../utils/mocks/game'

describe('game.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const { initiateGame } = useGameStore()

    initiateGame(players)
  })

  it('should initiate game', () => {
    const { state } = useGameStore()
    expect(state.currentPlayerId).toBe('1')
    expect(state.pawns).toEqual({
      1: { small: 3, medium: 3, big: 3 },
      2: { small: 3, medium: 3, big: 3 },
    })
    expect(state.board.flat()).toEqual([null, null, null, null, null, null, null, null, null])
    expect(state.status).toBe('pregame')
  })

  it('should put pawn in empty cell', () => {
    const { state, putPawn } = useGameStore()
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })

    expect(state.currentPlayerId).toBe('2')
    expect(state.pawns[1].small).toBe(2)
    expect(state.board[0][0]).toEqual({ size: 'small', playerId: '1' })
  })

  it('should replace smaller pawn with bigger one', () => {
    const { state, putPawn } = useGameStore()
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0]).toEqual({ size: 'medium', playerId: '2' })
  })

  it('should not replace bigger pawn with smaller one', () => {
    const { state, putPawn } = useGameStore()
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0]).toEqual({ size: 'medium', playerId: '1' })
  })

  it('should return players ids', () => {
    const { getPlayers } = useGameStore()

    expect(getPlayers()).toEqual(['1', '2'])
  })

  it('should lock pawns for player', () => {
    const { state, lockPawns } = useGameStore()

    lockPawns('1', { small: 3, medium: 5, big: 1 })
    expect(state.status).toBe('pregame')
    expect(state.pawnsLockedBy).toEqual(['1'])
    expect(state.pawns['1']).toEqual({ small: 3, medium: 5, big: 1 })
    lockPawns('2', { small: 2, medium: 4, big: 3 })
    expect(state.pawns['2']).toEqual({ small: 2, medium: 4, big: 3 })

    expect(state.status).toBe('in-progress')
    expect(state.pawnsLockedBy).toEqual(['1', '2'])
  })
})
