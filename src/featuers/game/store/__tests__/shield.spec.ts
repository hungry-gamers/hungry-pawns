import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '../game.ts'
import { players } from '@/featuers/players/utils/mocks.ts'
import { usePlayersStore } from '@/featuers/players/store/players.ts'
import { lockPawns, playTurns } from '@/featuers/game/utils/scenarios.ts'

describe('game.store - shield', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const { initiateGame } = useGameStore()

    initiateGame(players)
    lockPawns([
      { id: '1', pawns: { small: 3, medium: 3, big: 3 } },
      { id: '2', pawns: { small: 3, medium: 3, big: 3 } },
    ])
  })

  it('should apply shield to the empty cell', () => {
    const { state, applyShield } = useGameStore()
    const spy = vi.spyOn(usePlayersStore(), 'useSpecialMove')
    applyShield({ rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0].shield.activeInTurn).toBe(2)
    expect(state.board[0][0].shield.appliedBy).toBe('1')

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('1', 'shield')
    expect(spy).toHaveReturnedWith('used')
  })

  it('should allow to apply shield only once per game per player', () => {
    const { state, applyShield } = useGameStore()
    applyShield({ rowIndex: 0, columnIndex: 0 })
    playTurns([{ pawnSize: 'small', rowIndex: 1, columnIndex: 0 }])

    applyShield({ rowIndex: 0, columnIndex: 0 })
    expect(state.currentPlayerId).toBe('1')
    playTurns([{ pawnSize: 'small', rowIndex: 1, columnIndex: 1 }])

    expect(state.board[0][0].shield.activeInTurn).toBe(2)
    expect(state.currentPlayerId).toBe('2')
  })

  it('should apply shield to the opponent cell', () => {
    const { state, applyShield } = useGameStore()
    playTurns([{ pawnSize: 'small', rowIndex: 0, columnIndex: 0 }])
    applyShield({ rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0].shield.activeInTurn).toBe(3)
    expect(state.board[0][0].shield.appliedBy).toBe('2')
  })

  it('should apply shield to the captured cell', () => {
    const { state, applyShield } = useGameStore()

    playTurns([
      { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
      { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
    ])

    applyShield({ rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0].shield.activeInTurn).toBe(4)
    expect(state.board[0][0].shield.appliedBy).toBe('1')
  })

  it('should protect cell from being captured', () => {
    const { state, applyShield } = useGameStore()
    applyShield({ rowIndex: 0, columnIndex: 0 })
    playTurns([{ pawnSize: 'small', rowIndex: 0, columnIndex: 0 }])

    expect(state.board[0][0].pawn).toBeNull()
  })
})
