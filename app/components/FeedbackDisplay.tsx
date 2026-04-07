import { Direction } from '../types/game'

interface FeedbackDisplayProps {
  correct: boolean
  streak: number
  direction: Direction
  timedOut: boolean
}

export function FeedbackDisplay({
  correct,
  streak,
  direction,
  timedOut,
}: FeedbackDisplayProps) {
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
