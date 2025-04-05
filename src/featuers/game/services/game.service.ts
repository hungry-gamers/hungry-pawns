import * as GameT from '@/featuers/game/store/types.ts'
import type { Sequence } from '@/featuers/game/store/types.ts'

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

export const findWinningLine = (board: GameT.Board): Sequence[] => {
  const line: Sequence[] = []

  const isWinningLine = (line: GameT.Cell[]) => {
    if (line.some((cell) => !cell.pawn)) return false
    const playerId = line[0].pawn?.playerId
    return line.every((cell) => cell.pawn?.playerId === playerId)
  }

  for (let i = 0; i < 3; i++) {
    if (isWinningLine([board[i][0], board[i][1], board[i][2]])) {
      line.push(`${board[i][0].pawn?.playerId}/${i}-0/${i}-1/${i}-2`)
    }
    if (isWinningLine([board[0][i], board[1][i], board[2][i]])) {
      line.push(`${board[0][i].pawn?.playerId}/0-${i}/1-${i}/2-${i}`)
    }
  }

  if (isWinningLine([board[0][0], board[1][1], board[2][2]])) {
    line.push(`${board[0][0].pawn?.playerId}/0-0/1-1/2-2`)
  }
  if (isWinningLine([board[0][2], board[1][1], board[2][0]])) {
    line.push(`${board[0][2].pawn?.playerId}/0-2/1-1/2-0`)
  }

  return line
}
