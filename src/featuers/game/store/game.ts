import { reactive } from 'vue'
import { defineStore } from 'pinia'
import * as GameT from '@/featuers/game/types.ts'
import * as PlayersT from '@/featuers/players/types'
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

  const initiateGame = (players: PlayersT.PlayerPayload[]) => {
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

  const getLastTurn = () => {
    return Math.max(...Object.keys(state.turns).map(Number), 0)
  }

  const getCurrentTurn = () => {
    return getLastTurn() + 1
  }

  const manageAllowedPawns = () => {
    const lastTurn = getLastTurn()
    const isMidTurn =
      state.allowedPawns.length === 2 && lastTurn < GameService.UNLOCK_BIG_PAWNS_TURN

    if (
      lastTurn < GameService.UNLOCK_MEDIUM_PAWNS_TURN ||
      isMidTurn ||
      lastTurn > GameService.UNLOCK_BIG_PAWNS_TURN
    ) {
      return
    }

    if (lastTurn === GameService.UNLOCK_MEDIUM_PAWNS_TURN) state.allowedPawns.push('medium')
    if (lastTurn === GameService.UNLOCK_BIG_PAWNS_TURN) state.allowedPawns.push('big')
  }

  const nextTurn = (payload: GameT.PutPawnPayload | GameT.ApplyShieldPayload) => {
    state.turns[getLastTurn() + 1] = { playerId: state.currentPlayerId, move: payload }
    state.currentPlayerId = playersStore
      .getPlayers()
      .find((player) => player !== state.currentPlayerId)!

    manageAllowedPawns()
  }

  const checkInstantWin = () => {
    const CAPTURED_PAWNS_FOR_INSTANT_WIN = 5
    const capturedCounter = playersStore.getCapturedPawnsCounter(state.currentPlayerId)

    return capturedCounter === CAPTURED_PAWNS_FOR_INSTANT_WIN
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

  const checkWinner = (payload: GameT.MovePayload) => {
    const isInstantWin = checkInstantWin()
    state.winner = isInstantWin ? state.currentPlayerId : isLineCaptureWin()

    if (!isInstantWin) nextTurn(payload)
    if (state.currentPlayerId === state.winner) {
      state.status = 'finished'
    }
  }

  const isPutPawnAllowed = (payload: GameT.PutPawnPayload) => {
    const { rowIndex, columnIndex, pawnSize } = payload
    const isProtected = state.board[rowIndex][columnIndex].shield.activeInTurn === getCurrentTurn()
    const isPawnAvailable = playersStore.isPawnAvailableForPlayer(state.currentPlayerId, pawnSize)
    const isPawnSizeAllowed = state.allowedPawns.includes(pawnSize)

    return isPawnAvailable && isPawnSizeAllowed && !isProtected
  }

  const isDropPawnAllowed = (payload: GameT.DropOpponentPawnPayload) => {
    const { rowIndex, columnIndex } = payload
    const isProtected = state.board[rowIndex][columnIndex].shield.activeInTurn === getCurrentTurn()
    const isPlayerPawn = state.board[rowIndex][columnIndex].pawn?.playerId === state.currentPlayerId

    return isProtected || isPlayerPawn
  }

  const dropOpponentPawn = (payload: GameT.MovePayload) => {
    if (isDropPawnAllowed(payload)) return
    if (playersStore.useSpecialMove(state.currentPlayerId, 'drop') === 'not-allowed') return

    const { rowIndex, columnIndex } = payload
    state.board[rowIndex][columnIndex].pawn = null

    checkWinner(payload)
  }

  const putPawn = (payload: GameT.PutPawnPayload) => {
    const { rowIndex, columnIndex, pawnSize } = payload
    const cellPawn = state.board[rowIndex][columnIndex].pawn

    if (!isPutPawnAllowed(payload) || state.status !== 'in-progress') return

    if (cellPawn) {
      if (!GameService.isPawnBigger(pawnSize, cellPawn.size)) return
      if (cellPawn.playerId !== state.currentPlayerId) {
        playersStore.updatePlayerCapturedPawns(state.currentPlayerId)
      }
    }

    state.board[rowIndex][columnIndex].pawn = {
      size: pawnSize,
      playerId: state.currentPlayerId,
    }
    playersStore.manipulatePawnAmount(state.currentPlayerId, pawnSize, -1)

    checkWinner(payload)
  }

  const applyShield = (payload: GameT.ApplyShieldPayload) => {
    if (playersStore.useSpecialMove(state.currentPlayerId, 'shield') === 'not-allowed') return
    const { rowIndex, columnIndex } = payload

    state.board[rowIndex][columnIndex].shield.appliedBy = state.currentPlayerId
    state.board[rowIndex][columnIndex].shield.activeInTurn = getLastTurn() + 2

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
    dropOpponentPawn,
  }
})
