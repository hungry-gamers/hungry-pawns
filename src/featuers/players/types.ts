import type { PawnSize, MoveName } from '@/featuers/game/types.ts'

export type Player = {
  pawns: Record<PawnSize, number>
  capturedPawnsCounter: number
  arePawnsLocked: boolean
  specialMoves: MoveName[]
  skippedTurnsCount: number
}

export type PlayerPayload = { id: string; pawns: Player['pawns'] }

export type SpecialMoveStatus = 'not-allowed' | 'used'

export type PlayersStore = {
  players: Record<string, Player>
  pawnsStatus: 'locked' | 'picking'
}
