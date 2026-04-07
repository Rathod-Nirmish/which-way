'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

import { Difficulty, Direction, MAX_TIME, TOTAL_ROUNDS } from '../types/game'
import { useGameReducer } from '../hooks/useGameReducer'
import { useMotivationalSpeech } from '../hooks/useMotivationalSpeech'
import { EasyVisual, MediumVisual, HardVisual } from './VisualCues'
import { FeedbackDisplay } from './FeedbackDisplay'
import { GameOver } from './GameOver'

export default function GameScreen() {
  const params = useSearchParams()
  const difficulty = (params.get('difficulty') ?? 'easy') as Difficulty
  const totalRounds = Math.max(1, parseInt(params.get('rounds') ?? String(TOTAL_ROUNDS), 10))
  const maxTime = MAX_TIME[difficulty]
  const hasTimer = difficulty !== 'easy'

  const [state, dispatch] = useGameReducer(maxTime)
  const speakMotivation = useMotivationalSpeech()
  const { phase, direction, round, score, streak, bestStreak, timeLeft, lastCorrect, paused } = state

  const [timedOut, setTimedOut] = useState(false)
  const [isHighScore, setIsHighScore] = useState(false)

  // Escape key → toggle pause
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dispatch({ type: 'TOGGLE_PAUSE' })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch])

  // Auto-advance after feedback (skip while paused)
  useEffect(() => {
    if (phase !== 'feedback' || paused) return
    const id = setTimeout(() => {
      setTimedOut(false)
      dispatch({ type: 'NEXT', maxTime, totalRounds })
    }, 1200)
    return () => clearTimeout(id)
  }, [phase, paused, maxTime, totalRounds, dispatch])

  // Countdown timer (medium / hard) — frozen while paused
  useEffect(() => {
    if (!hasTimer || phase !== 'asking' || paused) return
    if (timeLeft <= 0) {
      setTimedOut(true)
      speakMotivation()
      dispatch({ type: 'TIMEOUT' })
      return
    }
    const id = setTimeout(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, phase, hasTimer, paused, dispatch, speakMotivation])

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
    if (phase !== 'asking' || paused) return
    const correct = chosen === direction
    if (!correct) speakMotivation()
    dispatch({ type: 'ANSWER', correct })
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
        totalRounds={totalRounds}
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
    <div className={`relative min-h-screen bg-gray-950 text-white flex flex-col ${bgClass}`}>

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 shrink-0">
        <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm">
          ← Back
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">
            Round <span className="text-white font-bold">{round}</span>/{totalRounds}
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
        {Array.from({ length: totalRounds }, (_, i) => (
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
          disabled={phase !== 'asking' || paused}
          className="flex-1 py-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-xl font-black tracking-tight transition-all shadow-lg"
        >
          ← LEFT
        </button>
        <button
          onClick={() => handleAnswer('right')}
          disabled={phase !== 'asking' || paused}
          className="flex-1 py-6 rounded-2xl bg-violet-600 hover:bg-violet-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-xl font-black tracking-tight transition-all shadow-lg"
        >
          RIGHT →
        </button>
      </div>

      {/* Pause overlay */}
      {paused && (
        <div
          className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-5 z-50"
          onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
        >
          <div className="text-6xl">⏸</div>
          <h2 className="text-3xl font-black tracking-tight">Paused</h2>
          <p className="text-gray-400 text-sm">Press <kbd className="bg-gray-800 text-white px-2 py-0.5 rounded text-xs font-mono">Esc</kbd> or tap to resume</p>
        </div>
      )}

    </div>
  )
}
