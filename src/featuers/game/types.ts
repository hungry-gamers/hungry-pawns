export type PawnSize = 'small' | 'medium' | 'big'

export interface Pawn {
  size: PawnSize
  playerId: string
}

export type Move = {
  size: PawnSize
  mode: 'pawn' | 'shield'
}

export type Location = { rowIndex: number; columnIndex: number }

export type ApplyShieldPayload = Location

export type SpecialMoveName = 'shield'

export type Sequence = `${string}/${number}-${number}/${number}-${number}/${number}-${number}`

export type Cell = { pawn: Pawn | null; shield: { activeInTurn: number; appliedBy: string } }
export type Board = Cell[][]
export type Player = {
  pawns: Record<PawnSize, number>
  capturedPawnsCounter: number
  arePawnsLocked: boolean
  specialMoves: SpecialMoveName[]
}

export type PlayerPayload = { id: string; pawns: Player['pawns'] }

export type PutPawnPayload = { pawnSize: PawnSize } & Location

export type Game = {
  status: 'not-initialized' | 'pregame' | 'in-progress' | 'finished'
  board: Board
  currentPlayerId: string
  turns: Record<number, { playerId: string; move: PutPawnPayload | ApplyShieldPayload }>
  winner: string | undefined
  allowedPawns: PawnSize[]
  sequences: Sequence[]
}
