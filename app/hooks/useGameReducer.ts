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
  paused: boolean
}

export type GameAction =
  | { type: 'ANSWER'; correct: boolean }
  | { type: 'TIMEOUT' }
  | { type: 'NEXT'; maxTime: number; totalRounds: number }
  | { type: 'TICK' }
  | { type: 'RESET'; maxTime: number; totalRounds?: number }
  | { type: 'TOGGLE_PAUSE' }

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
    paused: false,
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
        paused: false,
      }
    }
    case 'TIMEOUT': {
      return {
        ...state,
        phase: 'feedback',
        streak: 0,
        lastCorrect: false,
        paused: false,
      }
    }
    case 'NEXT': {
      const totalRounds = action.totalRounds ?? TOTAL_ROUNDS
      if (state.round >= totalRounds) {
        return { ...state, phase: 'done' }
      }
      return {
        ...state,
        phase: 'asking',
        direction: pickDirection(),
        round: state.round + 1,
        timeLeft: action.maxTime,
        lastCorrect: null,
        paused: false,
      }
    }
    case 'TICK': {
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) }
    }
    case 'RESET': {
      return initState(action.maxTime)
    }
    case 'TOGGLE_PAUSE': {
      // Only allow pause during the asking phase
      if (state.phase !== 'asking') return state
      return { ...state, paused: !state.paused }
    }
  }
}

export function useGameReducer(maxTime: number) {
  return useReducer(reducer, maxTime, initState)
}
