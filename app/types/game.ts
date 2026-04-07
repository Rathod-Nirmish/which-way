export type Difficulty = 'easy' | 'medium' | 'hard'
export type Direction = 'left' | 'right'
export type Phase = 'asking' | 'feedback' | 'done'

export const TOTAL_ROUNDS = 10
export const MAX_TIME: Record<Difficulty, number> = { easy: 0, medium: 5, hard: 3 }
