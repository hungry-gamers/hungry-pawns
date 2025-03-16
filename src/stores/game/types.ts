export type PawnSize = 'small' | 'medium' | 'big'

export interface Pawn {
  size: PawnSize
  playerId: string
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

export type Game = {
  status: 'not-initialized' | 'pregame' | 'in-progress' | 'finished'
  board: Board
  currentPlayerId: string
  pawns: Record<string, Record<PawnSize, number>>
  pawnsLockedBy: string[]
  turns: Record<number, { playerId: string; move: PutPawnPayload }>
  potentialWinner: string | undefined
  eatenPawnsCounter: Record<string, number>
}

type WinCondition = 'captured-line' | 'pawns-eaten' | 'balance' | 'dominance'

export type WinData = { winnerId: string; winCondition: WinCondition } | { winnerId: undefined }
