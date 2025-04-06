import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../store/game.ts'
import { players } from '@/utils/mocks/game.ts'
import { usePlayersStore } from '@/featuers/players/store/players.ts'

describe('game.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const { initiateGame } = useGameStore()
    const spy = vi.spyOn(usePlayersStore(), 'createPlayers')

    initiateGame(players)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(players)
    vi.clearAllMocks()
  })

  const setupGame = () => {
    const { lockPawns } = useGameStore()
    lockPawns('1', { small: 3, medium: 3, big: 3 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })
  }

  it('should initiate game', () => {
    const { state } = useGameStore()

    expect(state.currentPlayerId).toBe('1')
    expect(state.status).toBe('pregame')
    expect(state.allowedPawns).toEqual(['small'])
    expect(state.winner).toBeUndefined()
    expect(state.sequences).toEqual([])

    expect(state.board.flat()).toEqual(
      Array(9).fill({ shield: { activeInTurn: -1, appliedBy: '' }, pawn: null }),
    )
  })

  it('should not allow player to put pawn on the board if game is not in progress', () => {
    const { state, putPawn } = useGameStore()
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0].pawn).toBeNull()
  })

  it('should put pawn in empty cell and switch turn', () => {
    const { state, putPawn } = useGameStore()
    const spy = vi.spyOn(usePlayersStore(), 'manipulatePawnAmount')
    setupGame()
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })

    expect(state.currentPlayerId).toBe('2')
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('1', 'small', -1)
    expect(state.board[0][0].pawn).toEqual({ size: 'small', playerId: '1' })
    expect(state.currentPlayerId).toBe('2')
  })

  it('should replace smaller pawn with bigger one', () => {
    const { state, putPawn } = useGameStore()
    setupGame()
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 1 })

    expect(state.board[0][1].pawn).toEqual({ size: 'medium', playerId: '1' })
  })

  it('should not replace bigger pawn with smaller one', () => {
    const { state, putPawn } = useGameStore()
    setupGame()

    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0].pawn).toEqual({ size: 'medium', playerId: '1' })
  })

  it('should lock pawns for player', () => {
    const { state, lockPawns } = useGameStore()
    const spy = vi.spyOn(usePlayersStore(), 'lockPawns')
    lockPawns('1', { small: 3, medium: 5, big: 1 })
    expect(state.status).toBe('pregame')
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith('1', { small: 3, medium: 5, big: 1 })
    lockPawns('2', { small: 2, medium: 4, big: 3 })
    expect(spy).toBeCalledTimes(2)
    expect(spy).toBeCalledWith('2', { small: 2, medium: 4, big: 3 })
    expect(state.status).toBe('in-progress')
  })

  it('should track all turns played in the game', () => {
    const { state, putPawn } = useGameStore()
    setupGame()

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })

    expect(state.turns).toEqual({
      1: { playerId: '1', move: { pawnSize: 'small', rowIndex: 0, columnIndex: 0 } },
      2: { playerId: '2', move: { pawnSize: 'small', rowIndex: 0, columnIndex: 1 } },
    })
  })

  it('should not allow player to put pawn on board when amount of pawns of selected size is 0', () => {
    const { putPawn, state } = useGameStore()
    setupGame()

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 2 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 2 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 2 })

    expect(state.board[2][2].pawn).toBeNull()
  })

  it('should count captured pawns per player', () => {
    const { putPawn } = useGameStore()
    setupGame()
    const spy = vi.spyOn(usePlayersStore(), 'getCapturedPawnsCounter')
    const manipulateSpy = vi.spyOn(usePlayersStore(), 'manipulatePawnAmount')

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 2 })

    vi.clearAllMocks()

    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 1 })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(manipulateSpy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith('1')
    expect(manipulateSpy).toHaveBeenCalledWith('1', 'medium', -1)

    vi.clearAllMocks()
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 0 })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(manipulateSpy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith('2')
    expect(manipulateSpy).toHaveBeenCalledWith('2', 'medium', -1)
  })

  it('should find a winner for 3 horizontally', () => {
    const { putPawn, state } = useGameStore()
    setupGame()

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 2 })

    putPawn({ pawnSize: 'medium', rowIndex: 1, columnIndex: 2 })
    expect(state.winner).toBe('1')
  })

  it('should find a winner for 3 vertically', () => {
    const { putPawn, state } = useGameStore()
    setupGame()

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 2, columnIndex: 0 })

    putPawn({ pawnSize: 'medium', rowIndex: 2, columnIndex: 1 })
    expect(state.winner).toBe('1')
  })

  it('should find a winner for 3 diagonally', () => {
    const { putPawn, state } = useGameStore()
    setupGame()

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 2, columnIndex: 2 })

    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 2 })
    expect(state.winner).toBe('1')
  })

  it('should check winner on apply shield', () => {
    const { putPawn, state, applyShield } = useGameStore()
    setupGame()

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 2 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 2 })
    putPawn({ pawnSize: 'medium', rowIndex: 2, columnIndex: 0 })
    applyShield({ rowIndex: 1, columnIndex: 2 })

    expect(state.winner).toBe('1')
    expect(state.status).toBe('finished')
  })

  it('should find out that player 1 is not a winner because pawn got captured', () => {
    const { putPawn, state } = useGameStore()
    setupGame()

    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 1, columnIndex: 2 })

    putPawn({ pawnSize: 'medium', rowIndex: 1, columnIndex: 0 })
    expect(state.winner).toBeUndefined()
  })

  it('should allow reuse of pawns captured by their owner', () => {
    const { putPawn } = useGameStore()
    const spy = vi.spyOn(usePlayersStore(), 'manipulatePawnAmount')
    setupGame()

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 1 })

    vi.clearAllMocks()

    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 0 })
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(1, '1', 'small', 1)
  })

  it('should find out that player 1 captured line first so he is a winner', () => {
    const { putPawn, state, lockPawns } = useGameStore()
    lockPawns('1', { small: 6, medium: 3, big: 0 })
    lockPawns('2', { small: 3, medium: 3, big: 3 })

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 2 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })

    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 2 })
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })

    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 2 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 1 })

    expect(state.winner).toBe('1')
  })

  it('should allow medium pawns after 4 turns', () => {
    const { putPawn, state } = useGameStore()
    setupGame()

    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 1 })
    putPawn({ pawnSize: 'medium', rowIndex: 1, columnIndex: 1 })

    expect(state.board[1][1].pawn).toBeNull()
    putPawn({ pawnSize: 'small', rowIndex: 1, columnIndex: 1 })
    putPawn({ pawnSize: 'small', rowIndex: 2, columnIndex: 2 })
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 0 })
    expect(state.board[0][0].pawn).toEqual({ size: 'medium', playerId: '1' })
  })

  it('should finish the game instantly when player captured 5 enemy pawns', () => {
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

    expect(state.winner).toBe('2')
    expect(state.status).toBe('finished')
  })
})
