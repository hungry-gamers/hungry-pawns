<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game/game.ts'

const { getPlayers } = useGameStore()

defineProps<{ ownerId: string }>()

const players = computed(getPlayers)
</script>

<template>
  <svg
    class="shield-icon"
    :class="{
      'player-1-text': ownerId === players[0],
      'player-2-text': ownerId === players[1],
    }"
    width="120"
    height="140"
    viewBox="0 0 100 120"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path class="shield-base" d="M50 5 L90 25 V55 C90 85 70 105 50 115 C30 105 10 85 10 55 V25 Z" />
    <path class="shield-gloss" d="M50 5 L90 25 V55 C90 75 70 95 50 105 C30 95 10 75 10 55 V25 Z" />
    <path class="shield-highlight" d="M15 30 Q50 0 85 30" />
  </svg>
</template>

<style scoped>
.shield-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 125px;
  height: 150px;
}

.shield-base {
  fill: currentColor;
  stroke: black;
  stroke-width: 3;
}

.shield-gloss {
  fill: white;
  fill-opacity: 0.3;
  transition: fill-opacity 0.3s ease-in-out;
}

.shield-highlight {
  fill: none;
  stroke: white;
  stroke-width: 3;
  stroke-opacity: 0.6;
}

.shield-icon:hover .shield-gloss {
  fill-opacity: 0.5;
}

.shield-icon:hover .shield-base {
  filter: drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.6));
}
</style>
