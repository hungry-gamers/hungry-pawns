<script setup lang="ts">
import TheGame from '@/components/TheGame/TheGame.vue'
import { useGameStore } from '@/stores/game/game.ts'
import { computed, onMounted, ref } from 'vue'
import type { PawnSize } from '@/stores/game/types.ts'
import { players } from '@/utils/mocks/game.ts'
import PlayerPawnPicker from '@/components/PlayerPawnPicker/PlayerPawnPicker.vue'

const { initiateGame, getPlayers, state } = useGameStore()
const pawnSize = ref<PawnSize>('small')

const gameStatus = computed(() => state.status)
const playersIds = computed(getPlayers)

const selectPawnSize = (size: PawnSize) => {
  pawnSize.value = size
}

onMounted(() => initiateGame(players))
</script>

<template>
  <div>
    {{ state }} --- {{ pawnSize }} -- {{ gameStatus }}
    <div v-if="gameStatus === 'pregame'">
      <PlayerPawnPicker :player-id="playersIds[0]" />
      <PlayerPawnPicker :player-id="playersIds[1]" />
    </div>

    <div v-else>
      <div>
        <button @click="selectPawnSize('small')">Small</button>
        <button @click="selectPawnSize('medium')">Medium</button>
        <button @click="selectPawnSize('big')">Big</button>
      </div>
      <TheGame :pawnSize="pawnSize" />
    </div>
  </div>
</template>
