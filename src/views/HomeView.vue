<script setup lang="ts">
import TheGame from '@/featuers/game/components/TheGame.vue'
import { useGameStore } from '@/featuers/game/store/game.ts'
import { computed, onMounted, ref, watch } from 'vue'
import * as GameT from '@/featuers/game/types.ts'
import { players } from '@/featuers/players/utils/mocks.ts'
import PlayerPawnPicker from '@/featuers/players/components/PlayerPawnPicker.vue'
import { usePlayersStore } from '@/featuers/players/store/players.ts'

const { initiateGame, skipTurn, state: gameState } = useGameStore()
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

const activateDropMode = () => {
  move.value.mode = 'drop'
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
    <div>
      Pawns eaten: {{ state.players }} --- {{ gameState.status }} --- {{ gameState.winner }}
    </div>
    <div v-if="gameStatus === 'pregame'" class="container">
      <PlayerPawnPicker :player-id="playersIds[0]" />
      <PlayerPawnPicker :player-id="playersIds[1]" />
    </div>
    <div v-else class="container">
      <div>
        <button @click="selectPawnSize('small')" :disabled="!areSmallPawnsAllowed">Small</button>
        <button @click="selectPawnSize('medium')" :disabled="!areMediumPawnsAllowed">Medium</button>
        <button @click="selectPawnSize('big')" :disabled="!areBigPawnsAllowed">Big</button>

        <button @click="skipTurn">Skip turn</button>
        <button @click="activateShieldMode">Shield</button>
        <button @click="activateDropMode">Drop</button>
      </div>

      <TheGame :move="move" />

      <div>
        <span>How to win</span>
        <div>Capture the line (horizontally, diagonally or vertically) and hold for 1 turn</div>
        <div>Capture 5 opponent pawns for instant win</div>
        <div>
          Capture a line using all 3 pawn sizes in order: small, medium, big - it will work in
          reversed order too (big, medium, small) for instant win
        </div>
        <span>Additional mechanics</span>
        <div>
          At the beginning of the game you can decide how many pawns of each size you will bring to
          the table
        </div>
        <div>
          Skipping turn applies penalty to the player who have to skip:
          <div>1 turn: give opponent small pawn</div>
          <div>2 turns: give opponent medium pawn</div>
          <div>3 turns: give opponent big pawn</div>
          <div>4 turns: give opponent additional shield</div>
          <div>5 turns: give opponent additional drop power</div>
        </div>
        <div>
          At the beginning of the game you can use only small pawns, medium pawns will be unlocked
          after 4 turns and big pawns will be unlocked after 10 turns (skipping turn counts as turn)
        </div>
        <div>
          Each player has one shield per game - you can use it to protect any cell from any action
          for one turn
        </div>
        <div>
          Each player has one "drop" super power - you can drop any opponent pawn from the board
        </div>
        <div>
          Capture middle top cell, bottom left and bottom right to paralyze opponent for one turn.
          Opponent will be protected from being paralyzed for next 3 turns
        </div>
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
