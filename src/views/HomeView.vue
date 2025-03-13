<script setup lang="ts">
import TheGame from '@/components/TheGame.vue'
import { useGameStore } from '@/stores/game/game.ts'
import { onMounted, ref } from 'vue'
import type { PawnSize } from '@/stores/game/types.ts'
import { players } from '@/utils/mocks/game.ts'

const { initiateGame, state } = useGameStore()
const pawnSize = ref<PawnSize>('small')

const selectPawnSize = (size: PawnSize) => {
  pawnSize.value = size
}

onMounted(() => initiateGame(players))
</script>

<template>
  <div>
    {{ state }} --- {{ pawnSize }}
    <div>
      <button @click="selectPawnSize('small')">Small</button>
      <button @click="selectPawnSize('medium')">Medium</button>
      <button @click="selectPawnSize('big')">Big</button>
    </div>
    <TheGame :pawnSize="pawnSize" />
  </div>
</template>
