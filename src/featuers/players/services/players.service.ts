import * as PlayersT from '@/featuers/players/types.ts'

export const createPlayer = (player: PlayersT.PlayerPayload): PlayersT.Player => ({
  pawns: { ...player.pawns },
  capturedPawnsCounter: 0,
  arePawnsLocked: false,
  specialMoves: ['shield', 'drop'],
})

export const MAXIMUM_PAWNS_PER_PLAYER = 9
