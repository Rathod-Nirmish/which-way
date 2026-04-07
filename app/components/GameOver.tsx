import Link from 'next/link'
import { Difficulty } from '../types/game'

interface GameOverProps {
  score: number
  totalRounds: number
  bestStreak: number
  difficulty: Difficulty
  isHighScore: boolean
  onPlayAgain: () => void
}

export function GameOver({
  score,
  totalRounds,
  bestStreak,
  difficulty,
  isHighScore,
  onPlayAgain,
}: GameOverProps) {
  const percent = score / totalRounds
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
          <p className="text-gray-500 text-sm">{diffLabel} mode · {totalRounds} rounds</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 space-y-5 border border-gray-800">
          {/* Score */}
          <div>
            <div className="text-6xl font-black">
              {score}
              <span className="text-2xl text-gray-500">/{totalRounds}</span>
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
