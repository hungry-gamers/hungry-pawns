<script setup lang="ts">
import PawnAmountCounter from '@/components/PawnAmountCounter/PawnAmountCounter.vue'
import { useGameStore } from '@/stores/game/game.ts'
import { ref, computed } from 'vue'
import { MAXIMUM_PAWNS_PER_PLAYER } from '@/utils/constants.ts'
import type { PawnSize } from '@/stores/game/types.ts'

const props = defineProps<{ playerId: string }>()

const { state } = useGameStore()

const pawns = ref({ ...state.pawns[props.playerId] })
const totalPawns = computed(() =>
  Object.values(pawns.value as Record<string, number>).reduce((sum, current) => sum + current, 0),
)

const isIncreaseButtonDisabled = computed(() => totalPawns.value === MAXIMUM_PAWNS_PER_PLAYER)

const onAmountChange = (payload: { amount: number; size: PawnSize }) => {
  pawns.value[payload.size] = payload.amount
}
</script>

<template>
  <div>
    <span>Player: {{ playerId }}</span>
    <PawnAmountCounter
      size="small"
      :amount="pawns.small"
      :is-increase-disabled="isIncreaseButtonDisabled"
      @on-amount-changed="onAmountChange"
    />
    <PawnAmountCounter
      size="medium"
      :amount="pawns.medium"
      :is-increase-disabled="isIncreaseButtonDisabled"
      @on-amount-changed="onAmountChange"
    />
    <PawnAmountCounter
      size="big"
      :amount="pawns.big"
      :is-increase-disabled="isIncreaseButtonDisabled"
      @on-amount-changed="onAmountChange"
    />
  </div>
</template>

<style scoped></style>
