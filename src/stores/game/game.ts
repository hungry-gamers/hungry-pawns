import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Game, PutPawnPayload, Player, PawnSize } from '@/stores/game/types.ts'

export const useGameStore = defineStore('game', () => {
  const state = reactive<Game>({
    status: 'not-initialized',
    board: Array.from({ length: 3 }, () => Array(3).fill(null)),
    currentPlayerId: '',
    pawns: {},
    pawnsLockedBy: [],
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
    return Object.keys(state.pawns)
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

  const putPawn = (payload: PutPawnPayload) => {
    if (!state.pawns[state.currentPlayerId][payload.pawnSize]) return
    const cellPawn = state.board[payload.rowIndex][payload.columnIndex]

    if (!cellPawn || isBigger(payload.pawnSize, cellPawn.size)) {
      const players = Object.keys(state.pawns)
      state.board[payload.rowIndex][payload.columnIndex] = {
        size: payload.pawnSize,
        playerId: state.currentPlayerId,
      }
      state.pawns[state.currentPlayerId][payload.pawnSize]--
      state.currentPlayerId = players.find((player) => player !== state.currentPlayerId)!
    }
  }

  return {
    state,
    initiateGame,
    putPawn,
    getPlayers,
    lockPawns,
  }
})
