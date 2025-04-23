import { defineStore } from 'pinia'
import { reactive } from 'vue'
import * as PlayersT from '@/featuers/players/types.ts'
import * as PlayersService from '@/featuers/players/services/players.service.ts'
import * as GameT from '@/featuers/game/types.ts'
import {
  LAST_PENALTY_ON_SKIPPED_TURN_ON,
  PARALYZE_PROTECTION_IN_TURNS,
} from '@/featuers/players/services/players.service.ts'

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

  const getOpponentId = (currentPlayerId: string) => {
    const players = getPlayers()

    return players.find((id) => id !== currentPlayerId)!
  }

  const isPawnAvailableForPlayer = (playerId: string, pawnSize: GameT.PawnSize) => {
    return state.players[playerId].pawns[pawnSize]
  }

  const updateSkippedTurnsCount = (playerId: string) => {
    state.players[playerId].skippedTurnsCount += 1

    if (state.players[playerId].skippedTurnsCount > LAST_PENALTY_ON_SKIPPED_TURN_ON) {
      return LAST_PENALTY_ON_SKIPPED_TURN_ON
    }

    return state.players[playerId].skippedTurnsCount
  }

  const manipulatePawnAmount = (
    playerId: string,
    pawnSize: GameT.PawnSize,
    changeAmountBy: number,
  ) => {
    state.players[playerId].pawns[pawnSize] += changeAmountBy
  }

  const paralyzePlayer = (playerId: string) => {
    if (state.players[playerId].paralyzed.isActive) return

    state.players[playerId].paralyzed.isActive = true
    state.players[playerId].paralyzed.protectionExpiresIn =
      PlayersService.PARALYZE_PROTECTION_IN_TURNS
  }

  const canPlayerBeParalyzed = (playerId: string) => {
    return state.players[playerId].paralyzed.protectionExpiresIn === 0
  }

  const isPlayerParalyzed = (playerId: string) => {
    return state.players[playerId].paralyzed.isActive
  }

  const removeParalyzeEffect = (playerId: string) => {
    if (!state.players[playerId].paralyzed.isActive) return

    state.players[playerId].paralyzed.isActive = false
  }

  const decreaseParalyzeProtection = (playerId: string) => {
    if (state.players[playerId].paralyzed.protectionExpiresIn === 0) return
    state.players[playerId].paralyzed.protectionExpiresIn -= 1
  }

  const updatePlayerCapturedPawns = (playerId: string) => {
    state.players[playerId].capturedPawnsCounter++
  }

  const addSpecialMove = (playerId: string, moveName: GameT.MoveName) => {
    state.players[playerId].specialMoves.push(moveName)
  }

  const useSpecialMove = (
    playerId: string,
    moveName: GameT.MoveName,
  ): PlayersT.SpecialMoveStatus => {
    const index = state.players[playerId].specialMoves.indexOf(moveName)
    if (index === -1) return 'not-allowed'

    state.players[playerId].specialMoves.splice(index, 1)

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
    removeParalyzeEffect,
    useSpecialMove,
    updateSkippedTurnsCount,
    getOpponentId,
    addSpecialMove,
    canPlayerBeParalyzed,
    decreaseParalyzeProtection,
    paralyzePlayer,
    isPlayerParalyzed,
  }
})
