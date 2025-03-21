import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '../game'
import { players } from '../../../utils/mocks/game'

describe('game.store - shield', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const { initiateGame, lockPawns } = useGameStore()

    initiateGame(players)
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })
  })

  it('should apply shield to the empty cell', () => {
    const { state, applyShield } = useGameStore()
    applyShield({ rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0].shield.activeInTurn).toBe(2)
    expect(state.board[0][0].shield.appliedBy).toBe('1')
    expect(state.players['1'].specialMoves.includes('shield')).toBe(false)
  })

  it('should allow to apply shield only once per game per player', () => {
    const { state, applyShield, putPawn } = useGameStore()
    applyShield({ rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    applyShield({ rowIndex: 0, columnIndex: 0 })
    expect(state.currentPlayerId).toBe('1')
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })

    expect(state.board[0][0].shield.activeInTurn).toBe(2)
    expect(state.currentPlayerId).toBe('2')
  })

  it('should apply shield to the opponent cell', () => {
    const { state, applyShield, putPawn } = useGameStore()
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    applyShield({ rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0].shield.activeInTurn).toBe(3)
    expect(state.board[0][0].shield.appliedBy).toBe('2')
  })

  it('should apply shield to the captured cell', () => {
    const { state, applyShield, putPawn } = useGameStore()
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    applyShield({ rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0].shield.activeInTurn).toBe(4)
    expect(state.board[0][0].shield.appliedBy).toBe('1')
  })

  it('should protect cell from being captured', () => {
    const { state, applyShield, putPawn } = useGameStore()
    applyShield({ rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0].pawn).toBeNull()
  })
})
