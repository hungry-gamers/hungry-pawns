import * as GameT from '@/stores/game/types.ts'
import type { Pawn } from '@/stores/game/types.ts'

export const createPlayer = (player: GameT.PlayerPayload): GameT.Player => ({
  pawns: { ...player.pawns },
  capturedPawnsCounter: 0,
  arePawnsLocked: false,
  specialMoves: ['shield'],
})

export const isPawnBigger = (size: GameT.PawnSize, pawnOnBoardSize: GameT.PawnSize) => {
  const order: GameT.PawnSize[] = ['small', 'medium', 'big']
  return order.indexOf(size) > order.indexOf(pawnOnBoardSize)
}

export const createCell = (pawn?: GameT.Pawn): GameT.Cell => ({
  shield: { activeInTurn: -1, appliedBy: '' },
  pawn: pawn ?? null,
})

export const createBoard = () => {
  return Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => createCell()))
}
