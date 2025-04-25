import { reactive } from 'vue'
import { defineStore } from 'pinia'
import * as GameT from '@/featuers/game/types.ts'
import * as PlayersT from '@/featuers/players/types'
import * as GameService from '@/featuers/game/services/game.service.ts'
import { usePlayersStore } from '@/featuers/players/store/players.ts'
import { SpecialEffectsSequences } from '@/featuers/game/services/game.service.ts'

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
    const rejectConditions = [
      lastTurn < GameService.UNLOCK_MEDIUM_PAWNS_TURN,
      state.allowedPawns.length === 2 && lastTurn < GameService.UNLOCK_BIG_PAWNS_TURN,
      lastTurn > GameService.UNLOCK_BIG_PAWNS_TURN,
    ]

    if (rejectConditions.some(Boolean)) return
    if (lastTurn === GameService.UNLOCK_MEDIUM_PAWNS_TURN) state.allowedPawns.push('medium')
    if (lastTurn === GameService.UNLOCK_BIG_PAWNS_TURN) state.allowedPawns.push('big')
  }

  const nextTurn = (payload?: GameT.PutPawnPayload | GameT.ApplyShieldPayload) => {
    playersStore.decreaseParalyzeProtection(state.currentPlayerId)
    state.turns[getLastTurn() + 1] = { playerId: state.currentPlayerId, move: payload || 'skip' }
    state.currentPlayerId = playersStore
      .getPlayers()
      .find((player) => player !== state.currentPlayerId)!

    manageAllowedPawns()
  }

  const checkInstantWin = () => {
    const CAPTURED_PAWNS_FOR_INSTANT_WIN = 5
    const player = playersStore.getPlayer(state.currentPlayerId)

    return player.capturedPawnsCounter === CAPTURED_PAWNS_FOR_INSTANT_WIN
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

  const skipTurn = () => {
    const result = playersStore.updateSkippedTurnsCount(state.currentPlayerId)
    const opponentId = playersStore.getOpponentId(state.currentPlayerId)

    const penalties: Record<number, () => void> = {
      1: () => playersStore.manipulatePawnAmount(opponentId, 'small', 1),
      2: () => playersStore.manipulatePawnAmount(opponentId, 'medium', 1),
      3: () => playersStore.manipulatePawnAmount(opponentId, 'big', 1),
      4: () => playersStore.addSpecialMove(opponentId, 'shield'),
      5: () => playersStore.addSpecialMove(opponentId, 'drop'),
    }

    penalties[result]()

    playersStore.removeParalyzeEffect(state.currentPlayerId)

    nextTurn()
  }

  const checkWinner = (payload: GameT.MovePayload) => {
    const isInstantWin = checkInstantWin()
    state.winner = isInstantWin ? state.currentPlayerId : isLineCaptureWin()

    if (!isInstantWin) nextTurn(payload)
    if (state.currentPlayerId === state.winner) {
      state.status = 'finished'
    }
  }

  const isCellProtected = ({ rowIndex, columnIndex }: GameT.Location) => {
    return state.board[rowIndex][columnIndex].shield.activeInTurn === getCurrentTurn()
  }

  const isPutPawnAllowed = (payload: GameT.PutPawnPayload) => {
    const player = playersStore.getPlayer(state.currentPlayerId)
    const { rowIndex, columnIndex, pawnSize } = payload
    const isPawnAvailable = player.pawns[payload.pawnSize] > 0
    const isPawnSizeAllowed = state.allowedPawns.includes(pawnSize)

    return (
      isPawnAvailable &&
      isPawnSizeAllowed &&
      !isCellProtected({ rowIndex, columnIndex }) &&
      !playersStore.getPlayer(state.currentPlayerId).paralyzed.isActive
    )
  }

  const isDropPawnAllowed = (payload: GameT.DropOpponentPawnPayload) => {
    const { rowIndex, columnIndex } = payload
    const isPlayerPawn = state.board[rowIndex][columnIndex].pawn?.playerId === state.currentPlayerId

    return (
      !isCellProtected({ rowIndex, columnIndex }) &&
      !isPlayerPawn &&
      !playersStore.getPlayer(state.currentPlayerId).paralyzed.isActive
    )
  }

  const dropOpponentPawn = (payload: GameT.MovePayload) => {
    if (!isDropPawnAllowed(payload)) return
    if (playersStore.useSpecialMove(state.currentPlayerId, 'drop') === 'not-allowed') return

    const { rowIndex, columnIndex } = payload
    state.board[rowIndex][columnIndex].pawn = null

    checkWinner(payload)
  }

  const paralyzePlayer = () => {
    const opponentId = playersStore.getOpponentId(state.currentPlayerId)
    const result = SpecialEffectsSequences.paralyze.every(([row, column]) => {
      return state.board[row][column].pawn?.playerId === state.currentPlayerId
    })

    if (!result || !playersStore.canPlayerBeParalyzed(opponentId)) return

    playersStore.paralyzePlayer(playersStore.getOpponentId(state.currentPlayerId))
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

    paralyzePlayer()
    checkWinner(payload)
  }

  const applyShield = (payload: GameT.ApplyShieldPayload) => {
    if (playersStore.getPlayer(state.currentPlayerId).paralyzed.isActive) return
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
    skipTurn,
  }
})
