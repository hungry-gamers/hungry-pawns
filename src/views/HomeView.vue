<script setup lang="ts">
import TheGame from '@/components/TheGame/TheGame.vue'
import { useGameStore } from '@/featuers/game/store/game.ts'
import { computed, onMounted, ref, watch } from 'vue'
import * as GameT from '@/featuers/game/types.ts'
import { players } from '@/utils/mocks/game.ts'
import PlayerPawnPicker from '@/components/PlayerPawnPicker/PlayerPawnPicker.vue'
import { usePlayersStore } from '@/featuers/players/store/players.ts'

const { initiateGame, state: gameState } = useGameStore()
const { getPlayers, state } = usePlayersStore()
const move = ref<GameT.Move>({ size: 'small', mode: 'pawn' })

const gameStatus = computed(() => gameState.status)
const playersIds = computed(getPlayers)
const currentPlayerId = computed(() => gameState.currentPlayerId)
const areSmallPawnsAllowed = computed(() => state.players[currentPlayerId.value]?.pawns.small > 0)
const areMediumPawnsAllowed = computed(() => {
  return (
    state.players[currentPlayerId.value]?.pawns.medium > 0 &&
    gameState.allowedPawns.includes('medium')
  )
})
const areBigPawnsAllowed = computed(() => {
  return (
    state.players[currentPlayerId.value]?.pawns.big > 0 && gameState.allowedPawns.includes('big')
  )
})

const selectPawnSize = (size: GameT.PawnSize) => {
  move.value.mode = 'pawn'
  move.value.size = size
}

const activateShieldMode = () => {
  move.value.mode = 'shield'
}

onMounted(() => initiateGame(players))

watch(
  () => currentPlayerId.value,
  () => {
    if (areBigPawnsAllowed.value) selectPawnSize('big')
    if (areMediumPawnsAllowed.value) selectPawnSize('medium')
    if (areSmallPawnsAllowed.value) selectPawnSize('small')
  },
)
</script>

<template>
  <div>
    <div>Pawns eaten: {{ state.players }} --- {{ state.status }} --- {{ state.winner }}</div>
    <div v-if="gameStatus === 'pregame'" class="container">
      <PlayerPawnPicker :player-id="playersIds[0]" />
      <PlayerPawnPicker :player-id="playersIds[1]" />
    </div>
    <div v-else class="container">
      <div>
        <button @click="selectPawnSize('small')" :disabled="!areSmallPawnsAllowed">Small</button>
        <button @click="selectPawnSize('medium')" :disabled="!areMediumPawnsAllowed">Medium</button>
        <button @click="selectPawnSize('big')" :disabled="!areBigPawnsAllowed">Big</button>

        <button @click="activateShieldMode">Shield</button>
      </div>

      <TheGame :move="move" />

      <div>
        <span>How to win</span>
        <div>Capture the line (horizontally, diagonally or vertically) and hold for 1 turn</div>
        <div>Capture 5 opponent pawns for instant win</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
