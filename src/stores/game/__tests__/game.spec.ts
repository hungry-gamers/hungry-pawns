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
    expect(state.capturedPawnsCounter).toEqual({
      1: 0,
      2: 0,
    })
    expect(state.status).toBe('pregame')
    expect(state.allowedPawns).toEqual(['small'])
    expect(state.pawnsLockedBy.length).toBe(0)
  })

  it('should not allow player to put pawn on the board if game is not in progress', () => {
    const { state, putPawn } = useGameStore()
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0]).toBeNull()
  })

  it('should put pawn in empty cell', () => {
    const { state, putPawn, lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })

    expect(state.currentPlayerId).toBe('2')
    expect(state.pawns[1].small).toBe(2)
    expect(state.board[0][0]).toEqual({ size: 'small', playerId: '1' })
  })

  it('should replace smaller pawn with bigger one', () => {
    const { state, putPawn, lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 1 })

    expect(state.board[0][1]).toEqual({ size: 'medium', playerId: '1' })
  })

  it('should not replace bigger pawn with smaller one', () => {
    const { state, putPawn, lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
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

  it('should track all turns played in the game', () => {
    const { state, putPawn, lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })

    expect(state.turns).toEqual({
      1: { playerId: '1', move: { pawnSize: 'small', rowIndex: 0, columnIndex: 0 } },
      2: { playerId: '2', move: { pawnSize: 'small', rowIndex: 0, columnIndex: 1 } },
    })
  })

  it('should not allow player to put pawn on board when amount of pawns of selected size is 0', () => {
    const { putPawn, state, lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 2 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 2 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 2 })

    expect(state.board[2][2]).toBeNull()
  })

  it('should count captured pawns per player', () => {
    const { putPawn, state, lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 2 })
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 1 })
    expect(state.capturedPawnsCounter['1']).toBe(1)
    expect(state.pawns['1'].small).toBe(2)

    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 0 })
    expect(state.capturedPawnsCounter['2']).toBe(1)
    expect(state.pawns['2'].small).toBe(2)
  })

  it('should find a winner for 3 horizontally', () => {
    const { putPawn, state, lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 2 })

    expect(state.potentialWinner).toBe('1')

    putPawn({ pawnSize: 'medium', rowIndex: 1, columnIndex: 2 })
    expect(state.potentialWinner).toBe('1')
  })

  it('should find a winner for 3 vertically', () => {
    const { putPawn, state, lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 2, columnIndex: 0 })

    expect(state.potentialWinner).toBe('1')

    putPawn({ pawnSize: 'medium', rowIndex: 2, columnIndex: 1 })
    expect(state.potentialWinner).toBe('1')
  })

  it('should find a winner for 3 diagonally', () => {
    const { putPawn, state, lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 2, columnIndex: 2 })

    expect(state.potentialWinner).toBe('1')

    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 2 })
    expect(state.potentialWinner).toBe('1')
  })

  it('should find out that player 1 is not a winner because pawn got captured', () => {
    const { putPawn, state, lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 1, columnIndex: 2 })

    expect(state.potentialWinner).toBe('1')

    putPawn({ pawnSize: 'medium', rowIndex: 1, columnIndex: 0 })
    expect(state.potentialWinner).toBeUndefined()
  })

  it('should allow reuse of pawns captured by their owner', () => {
    const { putPawn, state, lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 1 })
    expect(state.pawns['1'].small).toBe(1)

    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 0 })
    expect(state.pawns['1'].small).toBe(2)
  })

  it('should finish the game instantly when player ate 5 enemy pawns', () => {
    const { putPawn, state, lockPawns } = useGameStore()
    lockPawns('1', { small: 6, medium: 3, big: 0 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })

    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 2 })
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 2 })

    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 2, columnIndex: 1 })

    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 0 })
    putPawn({ pawnSize: 'medium', rowIndex: 2, columnIndex: 0 })

    putPawn({ pawnSize: 'big', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'big', rowIndex: 1, columnIndex: 0 })

    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 2 })
    putPawn({ pawnSize: 'big', rowIndex: 2, columnIndex: 2 })

    expect(state.potentialWinner).toBe('2')
    expect(state.status).toBe('finished')
  })
})
