import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { PawnSize } from '@/stores/game/types.ts'

type Players = {
  pawns: Record<string, Record<PawnSize, number>>
  capturedPawnsCounter: Record<string, number>
}

export const usePlayersStore = defineStore('players', () => {
  const state = reactive<Players>({})
})
