import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Game, PutPawnPayload, Player, PawnSize, Cell } from '@/stores/game/types.ts'

export const useGameStore = defineStore('game', () => {
  const state = reactive<Game>({
    status: 'not-initialized',
    board: Array.from({ length: 3 }, () => Array(3).fill(null)),
    currentPlayerId: '',
    pawns: {},
    pawnsLockedBy: [],
    turns: {},
    capturedPawnsCounter: {},
    potentialWinner: undefined,
    allowedPawns: ['small'],
  })

  const initiateGame = (players: Player[]) => {
    state.status = 'pregame'
    state.board = Array.from({ length: 3 }, () => Array(3).fill(null))
    state.currentPlayerId = players[0].id
    state.allowedPawns = ['small']
    state.pawnsLockedBy = []

    players.forEach((player) => {
      state.pawns[player.id] = { ...player.pawns }
      state.capturedPawnsCounter[player.id] = 0
    })
  }

  const getPlayers = (): string[] => {
    return Object.keys(state.pawns)
  }

  const lockPawns = (playerId: string, pawns: Record<PawnSize, number>) => {
    if (state.pawnsLockedBy.includes(playerId)) return
    state.pawns[playerId] = { ...pawns }
    state.pawnsLockedBy.push(playerId)

    if (state.pawnsLockedBy.length === getPlayers().length) {
      state.status = 'in-progress'
    }
  }

  const isBigger = (size: PawnSize, pawnOnBoardSize: PawnSize) => {
    const order: PawnSize[] = ['small', 'medium', 'big']
    return order.indexOf(size) > order.indexOf(pawnOnBoardSize)
  }

  const checkInstantWin = () => {
    const AMOUNT_OF_EATEN_PAWNS_FOR_INSTANT_WIN = 5

    return (
      state.capturedPawnsCounter[state.currentPlayerId] === AMOUNT_OF_EATEN_PAWNS_FOR_INSTANT_WIN
    )
  }

  const isLineCaptureWin = (): string | undefined => {
    const board = state.board

    const isWinningLine = (line: Cell[]) => {
      if (line.some((cell) => !cell)) return false
      const playerId = line[0]?.playerId
      return line.every((cell) => cell?.playerId === playerId)
    }

    for (let i = 0; i < 3; i++) {
      if (isWinningLine([board[i][0], board[i][1], board[i][2]])) return board[i][0]?.playerId
      if (isWinningLine([board[0][i], board[1][i], board[2][i]])) return board[0][i]?.playerId
    }

    if (isWinningLine([board[0][0], board[1][1], board[2][2]])) return board[0][0]?.playerId
    if (isWinningLine([board[0][2], board[1][1], board[2][0]])) return board[0][2]?.playerId

    return undefined
  }

  const manageAllowedPawns = () => {
    const turnsPlayed = Object.keys(state.turns).length
    const TURNS_PLAYED_TO_UNLOCK_MEDIUM_PAWNS = 4
    const TURNS_PLAYED_TO_UNLOCK_BIG_PAWNS = 8
    const unlockSizes = [TURNS_PLAYED_TO_UNLOCK_MEDIUM_PAWNS, TURNS_PLAYED_TO_UNLOCK_BIG_PAWNS]

    if (
      state.allowedPawns.length < 3 &&
      turnsPlayed >= unlockSizes[state.allowedPawns.length - 1]
    ) {
      const payload = ['medium', 'big'][state.allowedPawns.length - 1] as PawnSize
      state.allowedPawns.push(payload)
    }
  }

  const nextTurn = (payload: PutPawnPayload) => {
    const lastTurn = Math.max(...Object.keys(state.turns).map(Number), 0)
    state.turns[lastTurn + 1] = { playerId: state.currentPlayerId, move: payload }
    state.currentPlayerId = Object.keys(state.pawns).find(
      (player) => player !== state.currentPlayerId,
    )!
  }

  const putPawn = (payload: PutPawnPayload) => {
    const { rowIndex, columnIndex, pawnSize } = payload
    const cellPawn = state.board[rowIndex][columnIndex]
    const moveNotAllowed =
      !state.pawns[state.currentPlayerId][pawnSize] ||
      !state.allowedPawns.includes(payload.pawnSize)

    if (moveNotAllowed || state.status !== 'in-progress') return

    if (cellPawn) {
      if (!isBigger(pawnSize, cellPawn.size)) return
      if (cellPawn.playerId !== state.currentPlayerId) {
        state.capturedPawnsCounter[state.currentPlayerId]++
      }

      state.pawns[state.currentPlayerId][cellPawn.size]++
    }

    const isInstantWin = checkInstantWin()

    state.board[rowIndex][columnIndex] = {
      size: pawnSize,
      playerId: state.currentPlayerId,
    }
    state.pawns[state.currentPlayerId][pawnSize]--
    state.potentialWinner = isInstantWin ? state.currentPlayerId : isLineCaptureWin()

    if (!isInstantWin) nextTurn(payload)
    if (state.currentPlayerId === state.potentialWinner) {
      state.status = 'finished'
    }

    manageAllowedPawns()
  }

  return {
    state,
    initiateGame,
    putPawn,
    getPlayers,
    lockPawns,
    isLineCaptureWin,
  }
})
