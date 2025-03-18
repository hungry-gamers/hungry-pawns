<script setup lang="ts">
import TheGame from '@/components/TheGame/TheGame.vue'
import { useGameStore } from '@/stores/game/game.ts'
import { computed, onMounted, ref, watch } from 'vue'
import type { PawnSize } from '@/stores/game/types.ts'
import { players } from '@/utils/mocks/game.ts'
import PlayerPawnPicker from '@/components/PlayerPawnPicker/PlayerPawnPicker.vue'

const { initiateGame, getPlayers, state } = useGameStore()
const pawnSize = ref<PawnSize>('small')

const gameStatus = computed(() => state.status)
const playersIds = computed(getPlayers)
const currentPlayerId = computed(() => state.currentPlayerId)
const areSmallPawnsAllowed = computed(() => state.pawns[currentPlayerId.value]?.small > 0)
const areMediumPawnsAllowed = computed(() => {
  return state.pawns[currentPlayerId.value]?.medium > 0 && state.allowedPawns.includes('medium')
})
const areBigPawnsAllowed = computed(() => {
  return state.pawns[currentPlayerId.value]?.big > 0 && state.allowedPawns.includes('big')
})

const selectPawnSize = (size: PawnSize) => {
  pawnSize.value = size
}

onMounted(() => initiateGame(players))

watch(
  () => currentPlayerId.value,
  () => {
    if (areBigPawnsAllowed.value) pawnSize.value = 'big'
    if (areMediumPawnsAllowed.value) pawnSize.value = 'medium'
    if (areSmallPawnsAllowed.value) pawnSize.value = 'small'
  },
)
</script>

<template>
  <div>
    <div>Pawns eaten: {{ state.eatenPawnsCounter }}</div>

    <div v-if="gameStatus === 'pregame'">
      <PlayerPawnPicker :player-id="playersIds[0]" />
      <PlayerPawnPicker :player-id="playersIds[1]" />
    </div>

    <div v-else>
      <div>
        <button @click="selectPawnSize('small')" :disabled="!areSmallPawnsAllowed">Small</button>
        <button @click="selectPawnSize('medium')" :disabled="!areMediumPawnsAllowed">Medium</button>
        <button @click="selectPawnSize('big')" :disabled="!areBigPawnsAllowed">Big</button>
      </div>
      <TheGame :pawnSize="pawnSize" />
      <div>
        <span>How to win</span>
        <div>Capture the line (horizontally, diagonally or vertically) and hold for 1 turn</div>
        <div>Capture 5 opponent pawns for instant win</div>
      </div>
    </div>
  </div>
</template>
