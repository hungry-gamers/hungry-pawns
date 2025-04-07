<script setup lang="ts">
import { useGameStore } from '@/featuers/game/store/game.ts'
import type { Move } from '@/featuers/game/types.ts'
import { computed } from 'vue'
import CellShield from '@/featuers/game/components/CellShield.vue'
import ThePawn from '@/featuers/game/components/ThePawn.vue'
import { usePlayersStore } from '@/featuers/players/store/players.ts'

const props = defineProps<{ move: Move }>()

const { putPawn, state, applyShield, getCurrentTurn } = useGameStore()
const { getPlayers } = usePlayersStore()

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
        <CellShield
          v-if="cell.shield.activeInTurn === getCurrentTurn()"
          :owner-id="cell.shield.appliedBy"
        />

        <ThePawn
          v-if="cell.pawn"
          :size="cell.pawn.size"
          :color="cell.pawn?.playerId === players[0] ? 'darkorange' : 'dodgerblue'"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cell:hover > :deep(svg .happy) {
  visibility: hidden;
}

.cell:hover > :deep(svg .scared) {
  visibility: visible;
}

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
