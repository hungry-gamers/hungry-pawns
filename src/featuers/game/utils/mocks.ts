import { createCell } from '@/featuers/game/services/game.service.ts'
import type { PutPawnPayload } from '@/featuers/game/types.ts'

export const BOARD_ROW_WIN = [
  [
    createCell({ size: 'small', playerId: '1' }),
    createCell({ size: 'small', playerId: '1' }),
    createCell({ size: 'small', playerId: '1' }),
  ],
  [createCell(), createCell(), createCell()],
  [createCell(), createCell(), createCell()],
]

export const BOARD_COLUMN_WIN = [
  [createCell(), createCell(), createCell({ size: 'small', playerId: '1' })],
  [createCell(), createCell(), createCell({ size: 'small', playerId: '1' })],
  [createCell(), createCell(), createCell({ size: 'small', playerId: '1' })],
]

export const BOARD_DIAGONAL_WIN = [
  [createCell({ size: 'small', playerId: '1' }), createCell(), createCell()],
  [createCell(), createCell({ size: 'small', playerId: '1' }), createCell()],
  [createCell(), createCell(), createCell({ size: 'small', playerId: '1' })],
]

export const PARALYZE_OPPONENT_TURNS: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 2 },
]

export const CAPTURED_PAWNS_WIN_TURNS: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 2 },
  { pawnSize: 'medium', rowIndex: 0, columnIndex: 2 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 1 },
  { pawnSize: 'medium', rowIndex: 2, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 0 },
  { pawnSize: 'medium', rowIndex: 2, columnIndex: 0 },
  { pawnSize: 'big', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'big', rowIndex: 1, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 2 },
  { pawnSize: 'big', rowIndex: 2, columnIndex: 2 },
]

export const FIRST_PLAYER_LINE_CAPTURED_WIN: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 0, columnIndex: 2 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 2 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 2 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 1 },
]

export const FIRST_PLAYER_LINE_CAPTURED_NOT_WIN: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 1, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 1 },
  { pawnSize: 'medium', rowIndex: 1, columnIndex: 2 },
  { pawnSize: 'medium', rowIndex: 1, columnIndex: 0 },
]

export const COLUMN_WIN_TURNS: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 2 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 2 },
  { pawnSize: 'medium', rowIndex: 2, columnIndex: 0 },
]

export const DIAGONALLY_WIN_TURNS: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 1 },
  { pawnSize: 'medium', rowIndex: 2, columnIndex: 2 },
  { pawnSize: 'medium', rowIndex: 0, columnIndex: 2 },
]

export const VERTICALLY_WIN_TURNS: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'medium', rowIndex: 2, columnIndex: 0 },
  { pawnSize: 'medium', rowIndex: 2, columnIndex: 1 },
]

export const HORIZONTALLY_WIN_TURNS: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'medium', rowIndex: 0, columnIndex: 2 },
  { pawnSize: 'medium', rowIndex: 1, columnIndex: 2 },
]

export const COUNT_CAPTURED_PAWNS_TURNS: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 2 },
]

export const PAWNS_LIMIT_REACHED_TURNS: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 2 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 2 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'medium', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 2 },
]

export const REPLACE_SMALLER_PAWN_WITH_BIGGER_PAWN_TURNS: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'medium', rowIndex: 0, columnIndex: 1 },
]

export const DONT_REPLACE_BIGGER_PAWN_WITH_SMALLER_PAWN_TURNS: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 1, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'medium', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
]

export const BALANCE_INSTANT_WIN_TURNS: PutPawnPayload[] = [
  { pawnSize: 'small', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 2 },
  { pawnSize: 'medium', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'big', rowIndex: 0, columnIndex: 2 },
]

export const BALANCE_INSTANT_WIN_TURNS_REVERSED: PutPawnPayload[] = [
  { pawnSize: 'big', rowIndex: 0, columnIndex: 0 },
  { pawnSize: 'small', rowIndex: 2, columnIndex: 2 },
  { pawnSize: 'medium', rowIndex: 0, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 1, columnIndex: 1 },
  { pawnSize: 'small', rowIndex: 0, columnIndex: 2 },
]
