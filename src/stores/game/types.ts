export type PawnSize = 'small' | 'medium' | 'big'

export interface Pawn {
  size: PawnSize
  playerId: string
  protectedUntilTheTurn: number | undefined
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

export type PutPawnPayload = { pawnSize: PawnSize; rowIndex: number; columnIndex: number }

type SpecialPowersNames = 'shield'

export type Game = {
  status: 'not-initialized' | 'pregame' | 'in-progress' | 'finished'
  board: Board
  currentPlayerId: string
  pawns: Record<string, Record<PawnSize, number>>
  pawnsLockedBy: string[]
  turns: Record<number, { playerId: string; move: PutPawnPayload }>
  potentialWinner: string | undefined
  capturedPawnsCounter: Record<string, number>
  allowedPawns: PawnSize[]
  specialPowersAvailable: Record<string, SpecialPowersNames[]>
}
