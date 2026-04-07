import { useReducer } from 'react'
import { Direction, Phase, TOTAL_ROUNDS } from '../types/game'

export interface GameState {
  phase: Phase
  direction: Direction
  round: number
  score: number
  streak: number
  bestStreak: number
  timeLeft: number
  lastCorrect: boolean | null
}

export type GameAction =
  | { type: 'ANSWER'; correct: boolean }
  | { type: 'TIMEOUT' }
  | { type: 'NEXT'; maxTime: number }
  | { type: 'TICK' }
  | { type: 'RESET'; maxTime: number }

export function pickDirection(): Direction {
  return Math.random() < 0.5 ? 'left' : 'right'
}

export function initState(maxTime: number): GameState {
  return {
    phase: 'asking',
    direction: pickDirection(),
    round: 1,
    score: 0,
    streak: 0,
    bestStreak: 0,
    timeLeft: maxTime,
    lastCorrect: null,
  }
}

export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ANSWER': {
      const newStreak = action.correct ? state.streak + 1 : 0
      return {
        ...state,
        phase: 'feedback',
        score: action.correct ? state.score + 1 : state.score,
        streak: newStreak,
        bestStreak: Math.max(state.bestStreak, newStreak),
        lastCorrect: action.correct,
      }
    }
    case 'TIMEOUT': {
      return {
        ...state,
        phase: 'feedback',
        streak: 0,
        lastCorrect: false,
      }
    }
    case 'NEXT': {
      if (state.round >= TOTAL_ROUNDS) {
        return { ...state, phase: 'done' }
      }
      return {
        ...state,
        phase: 'asking',
        direction: pickDirection(),
        round: state.round + 1,
        timeLeft: action.maxTime,
        lastCorrect: null,
      }
    }
    case 'TICK': {
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) }
    }
    case 'RESET': {
      return initState(action.maxTime)
    }
  }
}

export function useGameReducer(maxTime: number) {
  return useReducer(reducer, maxTime, initState)
}
