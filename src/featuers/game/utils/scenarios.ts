import { type PutPawnPayload } from '@/featuers/game/types.ts'
import { useGameStore } from '@/featuers/game/store/game.ts'
import type { PlayerPayload } from '@/featuers/players/types.ts'

export const playTurns = (putPawns: PutPawnPayload[]) => {
  const { putPawn } = useGameStore()

  putPawns.forEach((turn) => {
    putPawn(turn)
  })
}

export const lockPawns = (players: PlayerPayload[]) => {
  const { lockPawns } = useGameStore()

  players.forEach((player) => {
    lockPawns(player.id, player.pawns)
  })
}
