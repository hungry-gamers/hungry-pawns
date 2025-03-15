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
const hasSmallPawns = computed(() => state.pawns[currentPlayerId.value]?.small > 0)
const hasMediumPawns = computed(() => state.pawns[currentPlayerId.value]?.medium > 0)
const hasBigPawns = computed(() => state.pawns[currentPlayerId.value]?.big > 0)

const selectPawnSize = (size: PawnSize) => {
  pawnSize.value = size
}

onMounted(() => initiateGame(players))

watch(
  () => currentPlayerId.value,
  () => {
    if (hasBigPawns.value) pawnSize.value = 'big'
    if (hasMediumPawns.value) pawnSize.value = 'medium'
    if (hasSmallPawns.value) pawnSize.value = 'small'
  },
)
</script>

<template>
  <div>
    {{ state }}

    <div v-if="gameStatus === 'pregame'">
      <PlayerPawnPicker :player-id="playersIds[0]" />
      <PlayerPawnPicker :player-id="playersIds[1]" />
    </div>

    <div v-else>
      <div>
        <button @click="selectPawnSize('small')" :disabled="!hasSmallPawns">Small</button>
        <button @click="selectPawnSize('medium')" :disabled="!hasMediumPawns">Medium</button>
        <button @click="selectPawnSize('big')" :disabled="!hasBigPawns">Big</button>
      </div>
      <TheGame :pawnSize="pawnSize" />
    </div>
  </div>
</template>
