<script setup lang="ts">
import { useGameStore } from '@/stores/game/game.ts'
import type { PawnSize } from '@/stores/game/types.ts'

const props = defineProps<{ pawnSize: PawnSize }>()

const { putPawn, state } = useGameStore()

const onCellClick = (rowIndex: number, columnIndex: number) => {
  putPawn({
    pawn: { size: props.pawnSize, player: state.currentPlayerId },
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
  border: 1px solid black;
  cursor: pointer;
}

.cell:hover {
  background-color: #f0f0f0;
}
</style>
