export type PawnSize = 'small' | 'medium' | 'big'

export interface Pawn {
  size: PawnSize
  player: string
}

export type Cell = Pawn | null
export type Board = (Cell | null)[][]
export type Player = {
  id: string
  pawns: {
    small: number
    medium: number
    big: number
  }
}

export type Game = {
  status: 'not-initialized' | 'pregame' | 'in-progress' | 'finished'
  board: Board
  currentPlayerId: string
  pawns: Record<string, Record<PawnSize, number>>
}

export type PutPawnPayload = { pawn: Pawn; rowIndex: number; columnIndex: number }
