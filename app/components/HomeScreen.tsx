'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTIES: { key: Difficulty; label: string; icon: string; desc: string; time: string; border: string; glow: string; score_color: string }[] = [
  {
    key: 'easy',
    label: 'Easy',
    icon: '🐢',
    desc: 'Big arrows & the L-trick hint. No timer.',
    time: 'No time limit',
    border: 'border-emerald-500/60',
    glow: 'hover:border-emerald-400 hover:shadow-emerald-900/50',
    score_color: 'text-emerald-400',
  },
  {
    key: 'medium',
    label: 'Medium',
    icon: '⚡',
    desc: 'Race the clock — 5 seconds per question.',
    time: '5s per round',
    border: 'border-amber-500/60',
    glow: 'hover:border-amber-400 hover:shadow-amber-900/50',
    score_color: 'text-amber-400',
  },
  {
    key: 'hard',
    label: 'Hard',
    icon: '🔥',
    desc: "Mirrored view — answer from the character's perspective!",
    time: '3s per round',
    border: 'border-rose-500/60',
    glow: 'hover:border-rose-400 hover:shadow-rose-900/50',
    score_color: 'text-rose-400',
  },
]

const ROUND_OPTIONS = [5, 10, 20]

export default function HomeScreen() {
  const [scores, setScores] = useState<Record<Difficulty, number>>({ easy: 0, medium: 0, hard: 0 })
  const [selectedRounds, setSelectedRounds] = useState(10)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('which-way-scores')
      if (saved) setScores(JSON.parse(saved))
    } catch {
      // ignore
    }
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-5">
      <div className="max-w-md w-full space-y-8">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="text-7xl animate-bounce-slow select-none">👈👉</div>
          <h1 className="text-5xl font-black tracking-tight">Which Way?</h1>
          <p className="text-gray-400 text-lg">Master left &amp; right — once and for all!</p>
        </div>

        {/* Round count picker */}
        <div className="flex items-center justify-between bg-gray-900 rounded-2xl px-5 py-4 border border-gray-800">
          <span className="text-sm text-gray-400 font-medium">Rounds</span>
          <div className="flex gap-2">
            {ROUND_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setSelectedRounds(n)}
                className={`w-12 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  selectedRounds === n
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty cards */}
        <div className="space-y-3">
          {DIFFICULTIES.map((d) => (
            <Link
              key={d.key}
              href={`/game?difficulty=${d.key}&rounds=${selectedRounds}`}
              className={`flex items-center justify-between rounded-2xl border-2 ${d.border} ${d.glow} bg-gray-900 p-5 shadow-lg hover:shadow-xl hover:scale-[1.025] active:scale-[0.975] transition-all duration-150`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{d.icon}</span>
                <div>
                  <div className="font-bold text-lg leading-tight">{d.label}</div>
                  <div className="text-gray-400 text-sm leading-snug max-w-[200px]">{d.desc}</div>
                  <div className="text-gray-600 text-xs mt-0.5">{d.time}</div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className={`font-black text-3xl ${d.score_color}`}>{scores[d.key]}</div>
                <div className="text-gray-600 text-xs">best</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Tip card */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-sm text-gray-400 text-center space-y-1">
          <p>
            Tap <span className="font-bold text-white">LEFT</span> or{' '}
            <span className="font-bold text-white">RIGHT</span> to match the direction shown.
          </p>
          <p>
            Pro tip: your <span className="text-emerald-400 font-semibold">left hand</span> makes an{' '}
            <span className="font-bold text-white">"L"</span> shape with thumb &amp; index finger! 🤙
          </p>
        </div>

      </div>
    </main>
  )
}
