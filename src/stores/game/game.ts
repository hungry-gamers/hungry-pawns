import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Game, PutPawnPayload, Player, PawnSize, Cell } from '@/stores/game/types.ts'
import { AMOUNT_OF_EATEN_PAWNS_FOR_INSTANT_WIN } from '@/utils/constants.ts'

export const useGameStore = defineStore('game', () => {
  const state = reactive<Game>({
    status: 'not-initialized',
    board: Array.from({ length: 3 }, () => Array(3).fill(null)),
    currentPlayerId: '',
    pawns: {},
    pawnsLockedBy: [],
    turns: {},
    eatenPawnsCounter: {},
    potentialWinner: undefined,
  })

  const initiateGame = (players: Player[]) => {
    state.status = 'pregame'
    state.board = Array.from({ length: 3 }, () => Array(3).fill(null))
    state.currentPlayerId = players[0].id

    players.forEach((player) => {
      state.pawns[player.id] = { ...player.pawns }
      state.eatenPawnsCounter[player.id] = 0
    })
  }

  const getPlayers = (): string[] => {
    return Object.keys(state.pawns ?? {})
  }

  const lockPawns = (playerId: string, pawns: Record<PawnSize, number>) => {
    if (state.pawnsLockedBy.includes(playerId)) return
    state.pawnsLockedBy.push(playerId)
    state.pawns[playerId].small = pawns.small
    state.pawns[playerId].medium = pawns.medium
    state.pawns[playerId].big = pawns.big
    const [player1Id, player2Id] = getPlayers()

    if (state.pawnsLockedBy.includes(player1Id) && state.pawnsLockedBy.includes(player2Id)) {
      state.status = 'in-progress'
    }
  }

  const isBigger = (size: PawnSize, pawnOnBoardSize: PawnSize) => {
    const order: PawnSize[] = ['small', 'medium', 'big']
    return order.indexOf(size) > order.indexOf(pawnOnBoardSize)
  }

  const checkLineCaptureWinner = (): string | undefined => {
    const board = state.board

    if (state.eatenPawnsCounter[state.currentPlayerId] === 5) return state.currentPlayerId

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

  const putPawn = (payload: PutPawnPayload) => {
    const { rowIndex, columnIndex, pawnSize } = payload
    const currentPlayer = state.currentPlayerId
    const cellPawn = state.board[rowIndex][columnIndex]

    if (!state.pawns[currentPlayer][pawnSize]) return

    if (cellPawn && !isBigger(pawnSize, cellPawn.size)) return
    if (cellPawn && cellPawn.playerId !== state.currentPlayerId) {
      state.eatenPawnsCounter[currentPlayer]++
    }

    state.board[rowIndex][columnIndex] = { size: pawnSize, playerId: currentPlayer }
    state.pawns[currentPlayer][pawnSize]--

    const lastTurn = Math.max(...Object.keys(state.turns).map(Number), 0)
    state.turns[lastTurn + 1] = { playerId: currentPlayer, move: payload }

    if (state.eatenPawnsCounter[state.currentPlayerId] === AMOUNT_OF_EATEN_PAWNS_FOR_INSTANT_WIN) {
      state.potentialWinner = state.currentPlayerId
      state.status = 'finished'
    } else {
      state.potentialWinner = checkLineCaptureWinner()
      state.currentPlayerId = Object.keys(state.pawns).find((player) => player !== currentPlayer)!

      if (state.currentPlayerId === state.potentialWinner) {
        state.status = 'finished'
      }
    }
  }

  return {
    state,
    initiateGame,
    putPawn,
    getPlayers,
    lockPawns,
    checkLineCaptureWinner,
  }
})
