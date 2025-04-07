import { createCell } from '@/featuers/game/services/game.service.ts'

export const boardRowWin = [
  [
    createCell({ size: 'small', playerId: '1' }),
    createCell({ size: 'small', playerId: '1' }),
    createCell({ size: 'small', playerId: '1' }),
  ],
  [createCell(), createCell(), createCell()],
  [createCell(), createCell(), createCell()],
]

export const boardColumnWin = [
  [createCell(), createCell(), createCell({ size: 'small', playerId: '1' })],
  [createCell(), createCell(), createCell({ size: 'small', playerId: '1' })],
  [createCell(), createCell(), createCell({ size: 'small', playerId: '1' })],
]

export const boardDiagonalWin = [
  [createCell({ size: 'small', playerId: '1' }), createCell(), createCell()],
  [createCell(), createCell({ size: 'small', playerId: '1' }), createCell()],
  [createCell(), createCell(), createCell({ size: 'small', playerId: '1' })],
]
