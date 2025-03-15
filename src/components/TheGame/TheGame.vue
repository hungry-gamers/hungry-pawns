<script setup lang="ts">
import { useGameStore } from '@/stores/game/game.ts'
import type { PawnSize } from '@/stores/game/types.ts'
import { computed } from 'vue'

const props = defineProps<{ pawnSize: PawnSize }>()

const { putPawn, state, getPlayers } = useGameStore()

const players = computed(getPlayers)

const onCellClick = (rowIndex: number, columnIndex: number) => {
  putPawn({
    pawnSize: props.pawnSize,
    rowIndex,
    columnIndex,
  })
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
          'player-1': cell?.playerId === players[0],
          'player-2': cell?.playerId === players[1],
        }"
        @click="onCellClick(rowIndex, colIndex)"
      >
        <span v-if="cell">{{ cell.size }}</span>
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

.cell {
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
