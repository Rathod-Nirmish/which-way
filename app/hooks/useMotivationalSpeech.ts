import { useCallback, useEffect, useRef } from 'react'

const MOTIVATIONAL_PHRASES = [
  "Don't worry, you'll get it next time!",
  "Keep going, you're doing great!",
  "Almost! Try to focus on which hand makes an L.",
  "No worries, practice makes perfect!",
  "You can do this, keep trying!",
  "That was a tricky one — stay sharp!",
  "Oops! Take a breath and go again.",
  "Every mistake is a step closer to mastering it!",
]

export function useMotivationalSpeech() {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  // Pick a female voice once voices are loaded
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    function pickVoice() {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return

      // Prefer voices whose name contains "female", "woman", or common female names
      const femaleKeywords = /female|woman|samantha|victoria|karen|moira|veena|fiona|tessa|zira|hazel|susan|linda|google uk english female/i
      const female = voices.find(v => femaleKeywords.test(v.name))
      // Fall back to any non-male voice, then to first available
      voiceRef.current =
        female ??
        voices.find(v => !/male|man/i.test(v.name)) ??
        voices[0]
    }

    pickVoice()
    // voiceschanged fires asynchronously in most browsers
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', pickVoice)
    }
  }, [])

  const speakMotivation = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const phrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]
    const utterance = new SpeechSynthesisUtterance(phrase)

    if (voiceRef.current) utterance.voice = voiceRef.current
    utterance.rate = 1.05
    utterance.pitch = 1.2   // slightly higher pitch for a softer, feminine tone
    utterance.volume = 1

    // Cancel any ongoing speech before speaking
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }, [])

  return speakMotivation
}
