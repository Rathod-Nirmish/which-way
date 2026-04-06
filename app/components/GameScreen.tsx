'use client'

import { useReducer, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

type Difficulty = 'easy' | 'medium' | 'hard'
type Direction = 'left' | 'right'
type Phase = 'asking' | 'feedback' | 'done'

const TOTAL_ROUNDS = 10
const MAX_TIME: Record<Difficulty, number> = { easy: 0, medium: 5, hard: 3 }

// ─── Reducer ─────────────────────────────────────────────────────────────────

interface GameState {
  phase: Phase
  direction: Direction
  round: number
  score: number
  streak: number
  bestStreak: number
  timeLeft: number
  lastCorrect: boolean | null
}

type GameAction =
  | { type: 'ANSWER'; correct: boolean }
  | { type: 'TIMEOUT' }
  | { type: 'NEXT'; maxTime: number }
  | { type: 'TICK' }
  | { type: 'RESET'; maxTime: number }

function pickDirection(): Direction {
  return Math.random() < 0.5 ? 'left' : 'right'
}

function initState(maxTime: number): GameState {
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

function reducer(state: GameState, action: GameAction): GameState {
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

// ─── Visual Cue Components ───────────────────────────────────────────────────

function EasyVisual({ direction }: { direction: Direction }) {
  const isLeft = direction === 'left'
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Big animated arrow */}
      <div
        className={`text-[130px] leading-none select-none ${
          isLeft ? 'animate-slide-left' : 'animate-slide-right'
        }`}
      >
        {isLeft ? '⬅️' : '➡️'}
      </div>

      {/* L-trick hint */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-gray-500 text-xs uppercase tracking-widest">L-trick hint</p>
        <div className="flex gap-10">
          {/* Left hand */}
          <div
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              isLeft ? 'opacity-100 scale-110' : 'opacity-25 scale-90'
            }`}
          >
            <span className="text-5xl select-none">🤚</span>
            <span className={`text-xs font-semibold ${isLeft ? 'text-emerald-400' : 'text-gray-600'}`}>
              L = Left
            </span>
          </div>
          {/* Right hand (mirrored) */}
          <div
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              !isLeft ? 'opacity-100 scale-110' : 'opacity-25 scale-90'
            }`}
            style={{ transform: !isLeft ? 'scale(1.1) scaleX(-1)' : 'scale(0.9) scaleX(-1)' }}
          >
            <span className="text-5xl select-none">🤚</span>
            <span
              className={`text-xs font-semibold ${!isLeft ? 'text-violet-400' : 'text-gray-600'}`}
              style={{ transform: 'scaleX(-1)', display: 'block' }}
            >
              Right
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MediumVisual({ direction }: { direction: Direction }) {
  const isLeft = direction === 'left'
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Running character */}
      <div className={isLeft ? 'animate-slide-left' : 'animate-slide-right'}>
        <span
          className="text-8xl select-none block animate-run-bounce"
          style={{ transform: isLeft ? undefined : 'scaleX(-1)' }}
        >
          🏃
        </span>
      </div>

      {/* Direction label */}
      <div
        className={`text-5xl font-black tracking-tight ${
          isLeft ? 'text-blue-400' : 'text-violet-400'
        }`}
      >
        {isLeft ? '← LEFT' : 'RIGHT →'}
      </div>
    </div>
  )
}

function HardVisual({ direction }: { direction: Direction }) {
  // Character faces the user → their LEFT is on YOUR right side of screen
  // When direction='left', the arrow visually appears on the RIGHT of the screen
  const arrowOnRight = direction === 'left'

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">
        Answer from their perspective!
      </p>

      {/* Character + arrow row */}
      <div className="relative flex items-center justify-center w-56 h-28">
        {/* Left-side arrow */}
        <div
          className={`absolute left-0 text-5xl font-black text-yellow-300 transition-opacity duration-200 ${
            !arrowOnRight ? 'opacity-100' : 'opacity-0'
          }`}
        >
          ←
        </div>

        {/* Character facing you */}
        <div className="text-8xl select-none">🧍</div>

        {/* Right-side arrow */}
        <div
          className={`absolute right-0 text-5xl font-black text-yellow-300 transition-opacity duration-200 ${
            arrowOnRight ? 'opacity-100' : 'opacity-0'
          }`}
        >
          →
        </div>
      </div>

      <p className="text-gray-500 text-xs text-center max-w-[220px] leading-relaxed">
        The arrow shows <em>their</em> direction.
        <br />
        Which button matches <em>their</em> view?
      </p>
    </div>
  )
}

// ─── Feedback Display ────────────────────────────────────────────────────────

function FeedbackDisplay({
  correct,
  streak,
  direction,
  timedOut,
}: {
  correct: boolean
  streak: number
  direction: Direction
  timedOut: boolean
}) {
  if (correct) {
    return (
      <div className="flex flex-col items-center gap-3 animate-pop">
        <span className="text-7xl">✅</span>
        <p className="text-2xl font-bold text-emerald-400">
          {streak >= 5
            ? `🔥🔥 ${streak} streak!`
            : streak >= 3
            ? `🔥 ${streak} in a row!`
            : streak >= 2
            ? `⚡ ${streak} streak!`
            : 'Correct!'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 animate-shake">
      <span className="text-7xl">{timedOut ? '⏰' : '❌'}</span>
      <p className="text-2xl font-bold text-rose-400">
        {timedOut ? "Time's up!" : 'Wrong!'}
      </p>
      <p className="text-lg text-gray-300">
        It was{' '}
        <span className="font-black text-white">
          {direction === 'left' ? '← LEFT' : 'RIGHT →'}
        </span>
      </p>
    </div>
  )
}

// ─── Game Over Screen ────────────────────────────────────────────────────────

function GameOver({
  score,
  bestStreak,
  difficulty,
  isHighScore,
  onPlayAgain,
}: {
  score: number
  bestStreak: number
  difficulty: Difficulty
  isHighScore: boolean
  onPlayAgain: () => void
}) {
  const percent = score / TOTAL_ROUNDS
  const grade =
    percent === 1
      ? { emoji: '🏆', text: 'Perfect!' }
      : percent >= 0.8
      ? { emoji: '⭐', text: 'Excellent!' }
      : percent >= 0.6
      ? { emoji: '👍', text: 'Good job!' }
      : percent >= 0.4
      ? { emoji: '💪', text: 'Keep going!' }
      : { emoji: '🌱', text: 'Keep practicing!' }

  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-6 text-center">

        <div className="space-y-1">
          <div className="text-7xl animate-bounce">{grade.emoji}</div>
          <h2 className="text-3xl font-black">{grade.text}</h2>
          <p className="text-gray-500 text-sm">{diffLabel} mode · {TOTAL_ROUNDS} rounds</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 space-y-5 border border-gray-800">
          {/* Score */}
          <div>
            <div className="text-6xl font-black">
              {score}
              <span className="text-2xl text-gray-500">/{TOTAL_ROUNDS}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">correct</p>
          </div>

          {/* Streak */}
          {bestStreak >= 2 && (
            <div className="border-t border-gray-800 pt-4">
              <div className="text-2xl font-bold text-orange-400">🔥 {bestStreak} streak</div>
              <p className="text-gray-500 text-xs mt-0.5">best streak this game</p>
            </div>
          )}

          {/* High score badge */}
          {isHighScore && (
            <div className="border-t border-gray-800 pt-4">
              <div className="text-yellow-400 font-bold text-lg">⭐ New High Score!</div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 font-bold text-lg transition-all"
          >
            Play Again
          </button>
          <Link
            href="/"
            className="block w-full py-4 rounded-2xl bg-gray-800 hover:bg-gray-700 active:scale-95 font-bold text-lg transition-all text-gray-300"
          >
            ← Back Home
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main Game Component ──────────────────────────────────────────────────────

export default function GameScreen() {
  const params = useSearchParams()
  const difficulty = (params.get('difficulty') ?? 'easy') as Difficulty
  const maxTime = MAX_TIME[difficulty]
  const hasTimer = difficulty !== 'easy'

  const [state, dispatch] = useReducer(reducer, maxTime, initState)
  const { phase, direction, round, score, streak, bestStreak, timeLeft, lastCorrect } = state

  const [timedOut, setTimedOut] = useState(false)
  const [isHighScore, setIsHighScore] = useState(false)

  // Auto-advance after feedback
  useEffect(() => {
    if (phase !== 'feedback') return
    const id = setTimeout(() => {
      setTimedOut(false)
      dispatch({ type: 'NEXT', maxTime })
    }, 1200)
    return () => clearTimeout(id)
  }, [phase, maxTime])

  // Countdown timer (medium / hard)
  useEffect(() => {
    if (!hasTimer || phase !== 'asking') return
    if (timeLeft <= 0) {
      setTimedOut(true)
      dispatch({ type: 'TIMEOUT' })
      return
    }
    const id = setTimeout(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, phase, hasTimer])

  // Persist high score on game completion
  useEffect(() => {
    if (phase !== 'done') return
    try {
      const saved: Record<string, number> = JSON.parse(
        localStorage.getItem('which-way-scores') ?? '{}'
      )
      const prev = saved[difficulty] ?? 0
      if (score > prev) {
        saved[difficulty] = score
        localStorage.setItem('which-way-scores', JSON.stringify(saved))
        setIsHighScore(true)
      }
    } catch {
      // ignore
    }
  }, [phase, score, difficulty])

  function handleAnswer(chosen: Direction) {
    if (phase !== 'asking') return
    dispatch({ type: 'ANSWER', correct: chosen === direction })
  }

  function handlePlayAgain() {
    setIsHighScore(false)
    setTimedOut(false)
    dispatch({ type: 'RESET', maxTime })
  }

  if (phase === 'done') {
    return (
      <GameOver
        score={score}
        bestStreak={bestStreak}
        difficulty={difficulty}
        isHighScore={isHighScore}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  // Timer bar visual
  const timerPercent = maxTime > 0 ? (timeLeft / maxTime) * 100 : 100
  const timerColor =
    timeLeft <= 1
      ? 'bg-red-500'
      : timeLeft === 2
      ? 'bg-amber-500'
      : 'bg-blue-500'

  // Background flash on feedback
  const bgClass =
    phase === 'feedback'
      ? lastCorrect
        ? 'animate-pulse-green'
        : 'animate-pulse-red'
      : ''

  return (
    <div className={`min-h-screen bg-gray-950 text-white flex flex-col ${bgClass}`}>

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 shrink-0">
        <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm">
          ← Back
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">
            Round <span className="text-white font-bold">{round}</span>/{TOTAL_ROUNDS}
          </span>
          <span className="text-yellow-400 font-bold">Score: {score}</span>
          {streak >= 2 && (
            <span className="text-orange-400 font-bold">🔥 {streak}</span>
          )}
        </div>
      </header>

      {/* Timer bar */}
      {hasTimer && (
        <div className="mx-5 h-2.5 bg-gray-800 rounded-full overflow-hidden shrink-0">
          <div
            className={`h-full rounded-full ${timerColor} transition-all ease-linear`}
            style={{
              width: `${timerPercent}%`,
              transitionDuration: timerPercent < 100 ? '1000ms' : '0ms',
            }}
          />
        </div>
      )}

      {/* Round progress dots */}
      <div className="flex justify-center gap-1.5 py-4 shrink-0">
        {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i < round - 1
                ? 'w-2 h-2 bg-blue-500'
                : i === round - 1
                ? 'w-3 h-3 bg-white scale-110'
                : 'w-2 h-2 bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {phase === 'feedback' ? (
          <FeedbackDisplay
            correct={lastCorrect!}
            streak={streak}
            direction={direction}
            timedOut={timedOut}
          />
        ) : (
          <>
            {difficulty === 'easy' && <EasyVisual direction={direction} />}
            {difficulty === 'medium' && <MediumVisual direction={direction} />}
            {difficulty === 'hard' && <HardVisual direction={direction} />}
          </>
        )}
      </main>

      {/* Answer buttons */}
      <div className="flex gap-4 p-5 shrink-0">
        <button
          onClick={() => handleAnswer('left')}
          disabled={phase !== 'asking'}
          className="flex-1 py-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-xl font-black tracking-tight transition-all shadow-lg"
        >
          ← LEFT
        </button>
        <button
          onClick={() => handleAnswer('right')}
          disabled={phase !== 'asking'}
          className="flex-1 py-6 rounded-2xl bg-violet-600 hover:bg-violet-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-xl font-black tracking-tight transition-all shadow-lg"
        >
          RIGHT →
        </button>
      </div>

    </div>
  )
}
