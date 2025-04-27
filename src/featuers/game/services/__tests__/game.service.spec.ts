import { describe, expect, it } from 'vitest'
import * as GameService from '../game.service.ts'
import * as Mocks from '@/featuers/game/utils/mocks.ts'
import { BOARD_ROW_WIN } from '@/featuers/game/utils/mocks.ts'

describe('game.service', () => {
  it('should find out which pawn is bigger', () => {
    expect(GameService.isPawnBigger('small', 'medium')).toBe(false)
    expect(GameService.isPawnBigger('medium', 'small')).toBe(true)
    expect(GameService.isPawnBigger('big', 'medium')).toBe(true)
    expect(GameService.isPawnBigger('big', 'small')).toBe(true)
  })

  it('should create the cell', () => {
    expect(GameService.createCell()).toEqual({
      shield: { activeInTurn: -1, appliedBy: '' },
      pawn: null,
    })
  })

  it('should create winning sequence', () => {
    expect(GameService.findWinningLine(Mocks.BOARD_ROW_WIN)).toEqual([`1/0-0/0-1/0-2`])
    expect(GameService.findWinningLine(Mocks.BOARD_COLUMN_WIN)).toEqual([`1/0-2/1-2/2-2`])
    expect(GameService.findWinningLine(Mocks.BOARD_DIAGONAL_WIN)).toEqual([`1/0-0/1-1/2-2`])
  })

  it('should give cells from the sequence', () => {
    expect(GameService.getCellsFromSequence(`1/0-0/0-1/0-2`, BOARD_ROW_WIN)).toEqual([
      BOARD_ROW_WIN[0][0],
      BOARD_ROW_WIN[0][1],
      BOARD_ROW_WIN[0][2],
    ])
  })
})
