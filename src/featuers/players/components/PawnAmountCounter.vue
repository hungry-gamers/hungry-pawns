<script setup lang="ts">
import type { PawnSize } from '@/featuers/game/types.ts'
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
    <span>{{ size }}</span>
    <button @click="decrease" :disabled="isDecreaseDisabled" data-test-id="decrease-button">
      -
    </button>
    <span>{{ amount }}</span>
    <button @click="increase" :disabled="isIncreaseDisabled" data-test-id="increase-button">
      +
    </button>
  </div>
</template>

<style scoped></style>
