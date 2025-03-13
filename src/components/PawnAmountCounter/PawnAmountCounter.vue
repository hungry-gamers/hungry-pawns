<script setup lang="ts">
import type { PawnSize } from '@/stores/game/types.ts'
import { computed } from 'vue'

const props = defineProps<{
  size: PawnSize
  amount: number
  isIncreaseDisabled: boolean
}>()

const emit = defineEmits(['on-amount-changed'])

const isDecreaseDisabled = computed(() => props.amount === 0)

const decrease = () => {
  emit('on-amount-changed', { amount: props.amount - 1, size: props.size })
}

const increase = () => {
  emit('on-amount-changed', { amount: props.amount + 1, size: props.size })
}
</script>

<template>
  <div>
    <button @click="decrease" :disabled="isDecreaseDisabled">-</button>
    <span>{{ amount }}</span>
    <button @click="increase" :disabled="isIncreaseDisabled">+</button>
  </div>
</template>

<style scoped></style>
