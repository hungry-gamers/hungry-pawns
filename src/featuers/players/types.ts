import type { PawnSize, SpecialMoveName } from '@/featuers/game/types.ts'

export type Player = {
  pawns: Record<PawnSize, number>
  capturedPawnsCounter: number
  arePawnsLocked: boolean
  specialMoves: SpecialMoveName[]
}

export type PlayerPayload = { id: string; pawns: Player['pawns'] }

export type SpecialMoveStatus = 'not-allowed' | 'used'
