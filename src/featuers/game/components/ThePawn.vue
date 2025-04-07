<script setup lang="ts">
import type { PawnSize } from '@/featuers/game/types.ts'
import { computed } from 'vue'

const props = defineProps<{
  size: PawnSize
  color: string
}>()

const sizes = {
  small: 0.5,
  medium: 0.7,
  big: 1.0,
}

const scale = computed(() => sizes[props.size] || 1.0)
const width = computed(() => 100 * scale.value)
const height = computed(() => 120 * scale.value)
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    xmlns="http://www.w3.org/2000/svg"
    class="transition-transform duration-200 hover:scale-105"
  >
    <circle
      :cx="width / 2"
      :cy="height / 2"
      :r="40 * scale"
      :fill="color"
      stroke="#000"
      :stroke-width="4 * scale"
    />

    <circle class="happy" :cx="35 * scale" :cy="50 * scale" :r="5 * scale" fill="#000" />
    <circle class="happy" :cx="65 * scale" :cy="50 * scale" :r="5 * scale" fill="#000" />

    <path
      class="happy"
      :d="`M${35 * scale} ${70 * scale} Q${50 * scale} ${85 * scale} ${65 * scale} ${70 * scale}`"
      stroke="#000"
      :stroke-width="3 * scale"
      fill="none"
    />

    <circle class="scared" :cx="35 * scale" :cy="50 * scale" :r="5 * scale" fill="white" />
    <circle class="scared" :cx="65 * scale" :cy="50 * scale" :r="5 * scale" fill="white" />
    <line
      class="scared"
      :x1="35 * scale"
      :y1="70 * scale"
      :x2="65 * scale"
      :y2="70 * scale"
      stroke="black"
      :stroke-width="3 * scale"
    />
  </svg>
</template>

<style scoped>
svg {
  cursor: pointer;
}

.scared {
  visibility: hidden;
}
</style>
