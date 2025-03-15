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
    potentialWinner: undefined,
  })

  const initiateGame = (players: Player[]) => {
    state.status = 'pregame'
    state.board = Array.from({ length: 3 }, () => Array(3).fill(null))
    state.currentPlayerId = players[0].id

    players.forEach((player) => {
      state.pawns[player.id] = { ...player.pawns }
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

  const checkWinner = (): string | undefined => {
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

  const putPawn = (payload: PutPawnPayload) => {
    if (!state.pawns[state.currentPlayerId][payload.pawnSize]) return
    const cellPawn = state.board[payload.rowIndex][payload.columnIndex]

    if (cellPawn && !isBigger(payload.pawnSize, cellPawn.size)) return

    const players = Object.keys(state.pawns)
    state.board[payload.rowIndex][payload.columnIndex] = {
      size: payload.pawnSize,
      playerId: state.currentPlayerId,
    }
    state.pawns[state.currentPlayerId][payload.pawnSize]--
    const lastTurn = Object.keys(state.turns).reverse()[0] ?? 0
    state.turns[+lastTurn + 1] = { playerId: state.currentPlayerId, move: payload }
    state.potentialWinner = checkWinner()
    state.currentPlayerId = players.find((player) => player !== state.currentPlayerId)!

    if (state.currentPlayerId === state.potentialWinner) {
      state.status = 'finished'
      return state.potentialWinner
    }
  }

  return {
    state,
    initiateGame,
    putPawn,
    getPlayers,
    lockPawns,
    checkWinner,
  }
})
