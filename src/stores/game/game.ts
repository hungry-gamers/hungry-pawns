import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Game, PutPawnPayload, Player, PawnSize } from '@/stores/game/types.ts'

export const useGameStore = defineStore('game', () => {
  const state = reactive<Game>({
    board: Array.from({ length: 3 }, () => Array(3).fill(null)),
    currentPlayerId: '',
    pawns: {},
  })

  const initiateGame = (players: Player[]) => {
    state.board = Array.from({ length: 3 }, () => Array(3).fill(null))
    state.currentPlayerId = players[0].id

    players.forEach((player) => {
      state.pawns[player.id] = { ...player.pawns }
    })
  }

  const isBigger = (size: PawnSize, pawnOnBoardSize: PawnSize) => {
    const order: PawnSize[] = ['small', 'medium', 'big']
    return order.indexOf(size) > order.indexOf(pawnOnBoardSize)
  }

  const putPawn = (payload: PutPawnPayload) => {
    if (!state.pawns[state.currentPlayerId][payload.pawn.size]) return
    const cellPawn = state.board[payload.rowIndex][payload.columnIndex]

    if (!cellPawn || isBigger(payload.pawn.size, cellPawn.size)) {
      const players = Object.keys(state.pawns)
      state.board[payload.rowIndex][payload.columnIndex] = payload.pawn
      state.pawns[state.currentPlayerId][payload.pawn.size]--
      state.currentPlayerId = players.find((player) => player !== state.currentPlayerId)
    }
  }

  return {
    state,
    initiateGame,
    putPawn,
  }
})
