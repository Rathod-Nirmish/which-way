import { Suspense } from 'react'
import GameScreen from '../components/GameScreen'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-xl font-bold animate-pulse">Loading…</div>
    </div>
  )
}

export default function GamePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GameScreen />
    </Suspense>
  )
}
