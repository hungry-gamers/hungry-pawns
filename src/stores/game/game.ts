import { reactive } from 'vue'
import { defineStore } from 'pinia'
import * as GameT from '@/stores/game/types.ts'
import * as GameService from '@/services/game.service.ts'

export const useGameStore = defineStore('game', () => {
  const state = reactive<GameT.Game>({
    status: 'not-initialized',
    board: GameService.createBoard(),
    currentPlayerId: '',
    players: {},
    turns: {},
    potentialWinner: undefined,
    allowedPawns: ['small'],
  })

  const initiateGame = (players: GameT.PlayerPayload[]) => {
    state.status = 'pregame'
    state.board = GameService.createBoard()
    state.currentPlayerId = players[0].id
    state.allowedPawns = ['small']

    players.forEach((player) => {
      state.players[player.id] = GameService.createPlayer(player)
    })
  }

  const getPlayers = (): string[] => {
    return Object.keys(state.players)
  }

  const lockPawns = (playerId: string, pawns: Record<GameT.PawnSize, number>) => {
    if (state.players[playerId].arePawnsLocked) return
    state.players[playerId].pawns = { ...pawns }
    state.players[playerId].arePawnsLocked = true
    const locked = Object.values(state.players).filter(({ arePawnsLocked }) => arePawnsLocked)

    if (locked.length === getPlayers().length) {
      state.status = 'in-progress'
    }
  }

  const checkInstantWin = () => {
    const CAPTURED_PAWNS_FOR_INSTANT_WIN = 5
    const pawnsCapturedByPlayer = state.players[state.currentPlayerId].capturedPawnsCounter

    return pawnsCapturedByPlayer === CAPTURED_PAWNS_FOR_INSTANT_WIN
  }

  const isLineCaptureWin = (): string | undefined => {
    const board = state.board

    const isWinningLine = (line: GameT.Cell[]) => {
      if (line.some((cell) => !cell.pawn)) return false
      const playerId = line[0].pawn?.playerId
      return line.every((cell) => cell.pawn?.playerId === playerId)
    }

    for (let i = 0; i < 3; i++) {
      if (isWinningLine([board[i][0], board[i][1], board[i][2]])) return board[i][0].pawn?.playerId
      if (isWinningLine([board[0][i], board[1][i], board[2][i]])) return board[0][i].pawn?.playerId
    }

    if (isWinningLine([board[0][0], board[1][1], board[2][2]])) return board[0][0].pawn?.playerId
    if (isWinningLine([board[0][2], board[1][1], board[2][0]])) return board[0][2].pawn?.playerId

    return undefined
  }

  const manageAllowedPawns = () => {
    const turnsPlayed = Object.keys(state.turns).length
    const unlockThresholds = [4, 8]
    const pawnSizes: GameT.PawnSize[] = ['medium', 'big']

    const nextUnlockIndex = state.allowedPawns.length - 1

    if (
      nextUnlockIndex < unlockThresholds.length &&
      turnsPlayed >= unlockThresholds[nextUnlockIndex]
    ) {
      state.allowedPawns.push(pawnSizes[nextUnlockIndex])
    }
  }

  const getLastTurn = () => {
    return Math.max(...Object.keys(state.turns).map(Number), 0)
  }

  const getCurrentTurn = () => {
    return getLastTurn() + 1
  }

  const nextTurn = (payload: GameT.PutPawnPayload | GameT.ApplyShieldPayload) => {
    state.turns[getLastTurn() + 1] = { playerId: state.currentPlayerId, move: payload }
    state.currentPlayerId = Object.keys(state.players).find(
      (player) => player !== state.currentPlayerId,
    )!
  }

  const applyShield = (payload: GameT.ApplyShieldPayload) => {
    const { rowIndex, columnIndex } = payload
    state.players[state.currentPlayerId].specialMoves = state.players[
      state.currentPlayerId
    ].specialMoves.filter((move) => move !== 'shield')
    state.board[rowIndex][columnIndex].shield.appliedBy = state.currentPlayerId
    state.board[rowIndex][columnIndex].shield.activeInTurn = getLastTurn() + 2

    nextTurn(payload)
  }

  const putPawn = (payload: GameT.PutPawnPayload) => {
    const { rowIndex, columnIndex, pawnSize } = payload
    const cellPawn = state.board[rowIndex][columnIndex].pawn
    const isProtected = state.board[rowIndex][columnIndex].shield.activeInTurn === getCurrentTurn()
    const moveNotAllowed =
      !state.players[state.currentPlayerId].pawns[pawnSize] ||
      !state.allowedPawns.includes(payload.pawnSize) ||
      isProtected

    if (moveNotAllowed || state.status !== 'in-progress') return

    if (cellPawn) {
      if (!GameService.isPawnBigger(pawnSize, cellPawn.size)) return
      if (cellPawn.playerId !== state.currentPlayerId) {
        state.players[state.currentPlayerId].capturedPawnsCounter++
      }

      state.players[state.currentPlayerId].pawns[cellPawn.size]++
    }

    const isInstantWin = checkInstantWin()

    state.board[rowIndex][columnIndex].pawn = {
      size: pawnSize,
      playerId: state.currentPlayerId,
    }
    state.players[state.currentPlayerId].pawns[pawnSize]--
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
    applyShield,
    getCurrentTurn,
    isLineCaptureWin,
  }
})
