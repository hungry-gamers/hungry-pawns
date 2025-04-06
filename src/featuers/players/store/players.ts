import { defineStore } from 'pinia'
import { reactive } from 'vue'
import * as PlayersT from '@/featuers/players/types.ts'
import * as PlayersService from '@/featuers/players/services/players.service.ts'
import * as GameT from '@/featuers/game/types.ts'

export const usePlayersStore = defineStore('players', () => {
  const state = reactive<PlayersT.PlayersStore>({
    players: {},
    pawnsStatus: 'picking',
  })

  const createPlayers = (players: PlayersT.PlayerPayload[]) => {
    players.forEach((player) => {
      state.players[player.id] = PlayersService.createPlayer(player)
    })
  }

  const lockPawns = (playerId: string, pawns: Record<GameT.PawnSize, number>) => {
    if (state.players[playerId].arePawnsLocked) return
    state.players[playerId].pawns = { ...pawns }
    state.players[playerId].arePawnsLocked = true
    const locked = Object.values(state.players).filter(({ arePawnsLocked }) => arePawnsLocked)

    if (locked.length === getPlayers().length) {
      state.pawnsStatus = 'locked'
    }

    return state.pawnsStatus === 'locked'
  }

  const getCapturedPawnsCounter = (playerId: string) => {
    return state.players[playerId].capturedPawnsCounter
  }

  const getPawnsStatus = () => {
    return state.pawnsStatus
  }

  const getPlayers = (): string[] => {
    return Object.keys(state.players)
  }

  const isPawnAvailableForPlayer = (playerId: string, pawnSize: GameT.PawnSize) => {
    return state.players[playerId].pawns[pawnSize]
  }

  const manipulatePawnAmount = (
    playerId: string,
    pawnSize: GameT.PawnSize,
    changeAmountBy: number,
  ) => {
    state.players[playerId].pawns[pawnSize] += changeAmountBy
  }

  const updatePlayerCapturedPawns = (playerId: string) => {
    state.players[playerId].capturedPawnsCounter++
  }

  const useSpecialMove = (
    playerId: string,
    moveName: GameT.SpecialMoveName,
  ): PlayersT.SpecialMoveStatus => {
    if (!state.players[playerId].specialMoves.includes('shield')) return 'not-allowed'
    state.players[playerId].specialMoves = state.players[playerId].specialMoves.filter(
      (move) => move !== moveName,
    )

    return 'used'
  }

  return {
    state,
    createPlayers,
    getPlayers,
    lockPawns,
    getPawnsStatus,
    getCapturedPawnsCounter,
    isPawnAvailableForPlayer,
    manipulatePawnAmount,
    updatePlayerCapturedPawns,
    useSpecialMove,
  }
})
