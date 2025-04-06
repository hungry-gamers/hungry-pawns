import { reactive } from 'vue'
import { defineStore } from 'pinia'
import * as GameT from '@/featuers/game/types.ts'
import * as GameService from '@/featuers/game/services/game.service.ts'
import { usePlayersStore } from '@/featuers/players/store/players.ts'

export const useGameStore = defineStore('game', () => {
  const playersStore = usePlayersStore()

  const state = reactive<GameT.Game>({
    status: 'not-initialized',
    board: GameService.createBoard(),
    currentPlayerId: '',
    turns: {},
    winner: undefined,
    allowedPawns: ['small'],
    sequences: [],
  })

  const initiateGame = (players: GameT.PlayerPayload[]) => {
    state.status = 'pregame'
    state.board = GameService.createBoard()
    state.currentPlayerId = players[0].id
    state.allowedPawns = ['small']
    state.sequences = []
    state.winner = undefined

    playersStore.createPlayers(players)
  }

  const lockPawns = (playerId: string, pawns: Record<GameT.PawnSize, number>) => {
    if (playersStore.lockPawns(playerId, pawns)) {
      state.status = 'in-progress'
    }
  }

  const checkInstantWin = () => {
    const CAPTURED_PAWNS_FOR_INSTANT_WIN = 5

    return (
      playersStore.getCapturedPawnsCounter(state.currentPlayerId) === CAPTURED_PAWNS_FOR_INSTANT_WIN
    )
  }

  const isLineCaptureWin = (): string | undefined => {
    const sequences = GameService.findWinningLine(state.board)

    if (state.sequences.length > 0) {
      const sequence = state.sequences.find((cell) => sequences.includes(cell))

      if (sequence) {
        const [playerId] = sequence.split('/')
        return playerId
      }
    }

    state.sequences = sequences

    return undefined
  }

  const getLastTurn = () => {
    return Math.max(...Object.keys(state.turns).map(Number), 0)
  }

  const getCurrentTurn = () => {
    return getLastTurn() + 1
  }

  const nextTurn = (payload: GameT.PutPawnPayload | GameT.ApplyShieldPayload) => {
    state.turns[getLastTurn() + 1] = { playerId: state.currentPlayerId, move: payload }
    state.currentPlayerId = playersStore
      .getPlayers()
      .find((player) => player !== state.currentPlayerId)!

    manageAllowedPawns()
  }

  const checkWinner = (payload: GameT.ApplyShieldPayload | GameT.PutPawnPayload) => {
    const isInstantWin = checkInstantWin()
    state.winner = isInstantWin ? state.currentPlayerId : isLineCaptureWin()

    if (!isInstantWin) nextTurn(payload)
    if (state.currentPlayerId === state.winner) {
      state.status = 'finished'
    }
  }

  const manageAllowedPawns = () => {
    const unlockThresholds = [4, 10]
    const pawnSizes: GameT.PawnSize[] = ['medium', 'big']
    const nextUnlockIndex = state.allowedPawns.length - 1

    if (
      nextUnlockIndex < unlockThresholds.length &&
      getLastTurn() >= unlockThresholds[nextUnlockIndex]
    ) {
      state.allowedPawns.push(pawnSizes[nextUnlockIndex])
    }
  }

  const applyShield = (payload: GameT.ApplyShieldPayload) => {
    if (playersStore.useSpecialMove(state.currentPlayerId, 'shield') === 'not-allowed') return
    const { rowIndex, columnIndex } = payload

    state.board[rowIndex][columnIndex].shield.appliedBy = state.currentPlayerId
    state.board[rowIndex][columnIndex].shield.activeInTurn = getLastTurn() + 2

    checkWinner(payload)
  }

  const putPawn = (payload: GameT.PutPawnPayload) => {
    const { rowIndex, columnIndex, pawnSize } = payload
    const cellPawn = state.board[rowIndex][columnIndex].pawn
    const isProtected = state.board[rowIndex][columnIndex].shield.activeInTurn === getCurrentTurn()
    const moveNotAllowed =
      !playersStore.isPawnAvailableForPlayer(state.currentPlayerId, payload.pawnSize) ||
      !state.allowedPawns.includes(payload.pawnSize) ||
      isProtected

    if (moveNotAllowed || state.status !== 'in-progress') return

    if (cellPawn) {
      if (!GameService.isPawnBigger(pawnSize, cellPawn.size)) return
      if (cellPawn.playerId !== state.currentPlayerId) {
        playersStore.updatePlayerCapturedPawns(state.currentPlayerId)
      }

      playersStore.manipulatePawnAmount(state.currentPlayerId, cellPawn.size, 1)
    }

    state.board[rowIndex][columnIndex].pawn = {
      size: pawnSize,
      playerId: state.currentPlayerId,
    }
    playersStore.manipulatePawnAmount(state.currentPlayerId, pawnSize, -1)

    checkWinner(payload)
  }

  return {
    state,
    initiateGame,
    putPawn,
    lockPawns,
    applyShield,
    getCurrentTurn,
    isLineCaptureWin,
  }
})
