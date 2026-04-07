import { Direction } from '../types/game'

export function EasyVisual({ direction }: { direction: Direction }) {
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

export function MediumVisual({ direction }: { direction: Direction }) {
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

export function HardVisual({ direction }: { direction: Direction }) {
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
