<script setup lang="ts">
import PawnAmountCounter from '@/components/PawnAmountCounter/PawnAmountCounter.vue'
import { ref, computed } from 'vue'
import { MAXIMUM_PAWNS_PER_PLAYER } from '@/utils/constants.ts'
import type { PawnSize } from '@/featuers/game/types.ts'
import { usePlayersStore } from '@/featuers/players/store/players.ts'
import { useGameStore } from '@/featuers/game/store/game.ts'

const props = defineProps<{ playerId: string }>()

const { lockPawns } = useGameStore()
const { state } = usePlayersStore()

const pawns = ref({ ...state.players[props.playerId]?.pawns })

const isLocked = computed(() => state.players[props.playerId]?.arePawnsLocked)
const totalPawns = computed(() =>
  Object.values(pawns.value as Record<string, number>).reduce((sum, current) => sum + current, 0),
)

const isIncreaseButtonDisabled = computed(() => totalPawns.value === MAXIMUM_PAWNS_PER_PLAYER)
const canGetMorePawns = computed(() => totalPawns.value < MAXIMUM_PAWNS_PER_PLAYER)

const onAmountChange = (payload: { amount: number; size: PawnSize }) => {
  pawns.value[payload.size] = payload.amount
}
</script>

<template>
  <div>
    <span>Player: {{ playerId }}</span>
    <div v-if="isLocked">
      Your pawns: small: {{ pawns.small }} medium: {{ pawns.medium }} big: {{ pawns.big }}
    </div>
    <div v-else>
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

    <button
      @click="lockPawns(playerId, pawns)"
      :disabled="isLocked || canGetMorePawns"
      data-test-id="lock-pawns-button"
    >
      Lock
    </button>
  </div>
</template>

<style scoped></style>
