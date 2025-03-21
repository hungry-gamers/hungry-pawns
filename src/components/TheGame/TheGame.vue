<script setup lang="ts">
import { useGameStore } from '@/stores/game/game.ts'
import type { Move } from '@/stores/game/types.ts'
import { computed } from 'vue'
import Shield from '@/components/Shield.vue'

const props = defineProps<{ move: Move }>()

const { putPawn, state, getPlayers, applyShield, getCurrentTurn } = useGameStore()

const players = computed(getPlayers)

const onCellClick = (rowIndex: number, columnIndex: number) => {
  if (props.move.mode === 'pawn') {
    putPawn({
      pawnSize: props.move.size,
      rowIndex,
      columnIndex,
    })
  } else {
    applyShield({ rowIndex, columnIndex })
  }
}
</script>

<template>
  <div id="board">
    <div v-for="(row, rowIndex) in state.board" :key="rowIndex" class="row">
      <div
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        :data-test-id="`cell-${rowIndex}-${colIndex}`"
        class="cell"
        :class="{
          'player-1': cell.pawn?.playerId === players[0],
          'player-2': cell.pawn?.playerId === players[1],
        }"
        @click="onCellClick(rowIndex, colIndex)"
      >
        <Shield
          v-if="cell.shield.activeInTurn === getCurrentTurn()"
          :owner-id="cell.shield.appliedBy"
        />

        <span v-if="cell.pawn">{{ cell.pawn.size }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
#board {
  display: grid;
  grid-template-rows: repeat(3, 200px);
  gap: 5px;
  width: 610px;
}

.row {
  display: grid;
  grid-template-columns: repeat(3, 200px);
  gap: 5px;
}

.shield {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  opacity: 0.3;
  background: rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(3px);
}

.cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  background-color: white;
  border: 2px solid black;
  cursor: pointer;
}

.cell.player-1 {
  border: 2px solid darkorange;
}

.cell.player-2 {
  border: 2px solid dodgerblue;
}

.cell:hover {
  background: #d1d1d1;
}
</style>
