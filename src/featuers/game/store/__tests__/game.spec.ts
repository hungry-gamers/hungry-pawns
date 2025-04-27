import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../game'
import { players } from '@/featuers/players/utils/mocks'
import { usePlayersStore } from '@/featuers/players/store/players'
import { lockPawns, playTurns } from '@/featuers/game/utils/scenarios.ts'
import * as Mocks from '@/featuers/game/utils/mocks.ts'

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
    lockPawns([
      { id: '1', pawns: { small: 3, medium: 3, big: 3 } },
      { id: '2', pawns: { small: 3, medium: 3, big: 3 } },
    ])
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
    const { state } = useGameStore()
    playTurns([{ pawnSize: 'small', rowIndex: 0, columnIndex: 0 }])

    expect(state.board[0][0].pawn).toBeNull()
  })

  it('should apply penalties for skipping turns', () => {
    const { skipTurn } = useGameStore()
    const spy = vi.spyOn(usePlayersStore(), 'addSpecialMove')
    const manipulateSpy = vi.spyOn(usePlayersStore(), 'manipulatePawnAmount')

    setupGame()

    skipTurn()
    expect(manipulateSpy).toHaveBeenLastCalledWith('2', 'small', 1)
    playTurns([{ pawnSize: 'small', rowIndex: 0, columnIndex: 0 }])
    skipTurn()
    expect(manipulateSpy).toHaveBeenLastCalledWith('2', 'medium', 1)
    playTurns([{ pawnSize: 'small', rowIndex: 2, columnIndex: 1 }])
    skipTurn()
    expect(manipulateSpy).toHaveBeenLastCalledWith('2', 'big', 1)
    playTurns([{ pawnSize: 'small', rowIndex: 0, columnIndex: 1 }])
    skipTurn()
    expect(spy).toHaveBeenLastCalledWith('2', 'shield')

    playTurns([{ pawnSize: 'small', rowIndex: 2, columnIndex: 2 }])
    skipTurn()
    expect(spy).toHaveBeenLastCalledWith('2', 'drop')

    playTurns([{ pawnSize: 'small', rowIndex: 1, columnIndex: 0 }])
    skipTurn()
    expect(spy).toHaveBeenLastCalledWith('2', 'drop')
  })

  it('should put pawn in empty cell and switch turn', () => {
    const { state } = useGameStore()
    const spy = vi.spyOn(usePlayersStore(), 'manipulatePawnAmount')
    setupGame()

    playTurns([{ pawnSize: 'small', rowIndex: 0, columnIndex: 0 }])

    expect(state.currentPlayerId).toBe('2')
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('1', 'small', -1)
    expect(state.board[0][0].pawn).toEqual({ size: 'small', playerId: '1' })
    expect(state.currentPlayerId).toBe('2')
  })

  it('should replace smaller pawn with bigger one', () => {
    const { state } = useGameStore()
    setupGame()

    playTurns(Mocks.REPLACE_SMALLER_PAWN_WITH_BIGGER_PAWN_TURNS)

    expect(state.board[0][1].pawn).toEqual({ size: 'medium', playerId: '1' })
  })

  it('should not replace bigger pawn with smaller one', () => {
    const { state } = useGameStore()
    setupGame()
    playTurns(Mocks.DONT_REPLACE_BIGGER_PAWN_WITH_SMALLER_PAWN_TURNS)

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
    const { state } = useGameStore()
    setupGame()
    playTurns([
      { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
      { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
    ])

    expect(state.turns).toEqual({
      1: { playerId: '1', move: { pawnSize: 'small', rowIndex: 0, columnIndex: 0 } },
      2: { playerId: '2', move: { pawnSize: 'small', rowIndex: 0, columnIndex: 1 } },
    })
  })

  it('should not allow player to put pawn on board when amount of pawns of selected size is 0', () => {
    const { state } = useGameStore()
    setupGame()
    playTurns(Mocks.PAWNS_LIMIT_REACHED_TURNS)

    expect(state.board[2][2].pawn).toBeNull()
  })

  it('should count captured pawns per player', () => {
    const { putPawn } = useGameStore()
    const manipulateSpy = vi.spyOn(usePlayersStore(), 'manipulatePawnAmount')
    setupGame()
    playTurns(Mocks.COUNT_CAPTURED_PAWNS_TURNS)

    vi.clearAllMocks()

    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 1 })

    expect(manipulateSpy).toHaveBeenCalledTimes(1)
    expect(manipulateSpy).toHaveBeenCalledWith('1', 'medium', -1)

    vi.clearAllMocks()
    putPawn({ pawnSize: 'medium', rowIndex: 0, columnIndex: 0 })
    expect(manipulateSpy).toHaveBeenCalledTimes(1)
    expect(manipulateSpy).toHaveBeenCalledWith('2', 'medium', -1)
  })

  it('should find a winner for 3 horizontally', () => {
    const { state } = useGameStore()
    setupGame()
    playTurns(Mocks.HORIZONTALLY_WIN_TURNS)

    expect(state.winner).toBe('1')
  })

  it('should find a winner for 3 vertically', () => {
    const { state } = useGameStore()
    setupGame()
    playTurns(Mocks.VERTICALLY_WIN_TURNS)

    expect(state.winner).toBe('1')
  })

  it('should find a winner for 3 diagonally', () => {
    const { state } = useGameStore()
    setupGame()
    playTurns(Mocks.DIAGONALLY_WIN_TURNS)

    expect(state.winner).toBe('1')
  })

  it('should check winner on apply shield', () => {
    const { state, applyShield } = useGameStore()
    setupGame()
    playTurns(Mocks.COLUMN_WIN_TURNS)

    applyShield({ rowIndex: 1, columnIndex: 2 })

    expect(state.winner).toBe('1')
    expect(state.status).toBe('finished')
  })

  it('should find out that player 1 is not a winner because pawn got captured', () => {
    const { state } = useGameStore()
    setupGame()
    playTurns(Mocks.FIRST_PLAYER_LINE_CAPTURED_NOT_WIN)

    expect(state.winner).toBeUndefined()
  })

  it('should find out that player 1 captured line first so he is a winner', () => {
    const { state } = useGameStore()

    lockPawns([
      { id: '1', pawns: { small: 6, medium: 3, big: 0 } },
      { id: '2', pawns: { small: 3, medium: 3, big: 3 } },
    ])
    playTurns(Mocks.FIRST_PLAYER_LINE_CAPTURED_WIN)

    expect(state.winner).toBe('1')
  })

  it('should allow medium pawns after 4 turns', () => {
    const { state } = useGameStore()
    setupGame()

    playTurns([
      { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
      { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
      { pawnSize: 'medium', rowIndex: 1, columnIndex: 1 },
    ])

    expect(state.board[1][1].pawn).toBeNull()

    playTurns([
      { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
      { pawnSize: 'small', rowIndex: 2, columnIndex: 2 },
      { pawnSize: 'medium', rowIndex: 0, columnIndex: 0 },
    ])

    expect(state.board[0][0].pawn).toEqual({ size: 'medium', playerId: '1' })
  })

  it('should drop opponent pawn', () => {
    const { putPawn, dropOpponentPawn, state } = useGameStore()
    setupGame()
    const spy = vi.spyOn(usePlayersStore(), 'useSpecialMove')
    putPawn({ pawnSize: 'small', rowIndex: 0, columnIndex: 0 })
    dropOpponentPawn({ rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0].pawn).toBeNull()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('2', 'drop')
  })

  it('should prevent from dropping your own pawn', () => {
    const { dropOpponentPawn, state } = useGameStore()
    setupGame()
    const spy = vi.spyOn(usePlayersStore(), 'useSpecialMove')
    playTurns([
      { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
      { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
    ])

    dropOpponentPawn({ rowIndex: 0, columnIndex: 0 })

    expect(state.board[0][0].pawn).toEqual({ size: 'small', playerId: '1' })
    expect(spy).toHaveBeenCalledTimes(0)
  })

  it('should finish the game instantly when player captured 5 enemy pawns', () => {
    const { state } = useGameStore()

    lockPawns([
      { id: '1', pawns: { small: 6, medium: 3, big: 0 } },
      { id: '2', pawns: { small: 3, medium: 3, big: 3 } },
    ])

    playTurns(Mocks.CAPTURED_PAWNS_WIN_TURNS)

    expect(state.winner).toBe('2')
    expect(state.status).toBe('finished')
  })

  it('should paralyze opponent', () => {
    const { skipTurn } = useGameStore()

    lockPawns([
      { id: '1', pawns: { small: 6, medium: 3, big: 0 } },
      { id: '2', pawns: { small: 4, medium: 3, big: 2 } },
    ])

    const spy = vi.spyOn(usePlayersStore(), 'paralyzePlayer')
    const spyRemoveParalyze = vi.spyOn(usePlayersStore(), 'removeParalyzeEffect')

    playTurns(Mocks.PARALYZE_OPPONENT_TURNS)

    skipTurn()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spyRemoveParalyze).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('2')
    expect(spyRemoveParalyze).toHaveBeenCalledWith('2')
  })

  it('should search for the winner on skip turn', () => {
    const { state, skipTurn } = useGameStore()
    setupGame()

    playTurns([
      { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
      { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
      { pawnSize: 'small', rowIndex: 1, columnIndex: 0 },
      { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
      { pawnSize: 'medium', rowIndex: 2, columnIndex: 0 },
    ])

    skipTurn()

    expect(state.status).toBe('finished')
    expect(state.winner).toBe('1')
  })
})
