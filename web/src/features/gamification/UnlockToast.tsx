import { useEffect, useState } from 'react'
import type { Achievement } from '../../types/models'

interface UnlockToastProps {
  achievement: Achievement | null
}

export function UnlockToast({ achievement }: UnlockToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!achievement) return
    const showTimer = window.setTimeout(() => setVisible(true), 0)
    const hideTimer = window.setTimeout(() => setVisible(false), 4000)
    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [achievement])

  if (!achievement || !visible) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-5">
      <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-[0_10px_30px_rgba(45,49,66,0.16)] ring-2 ring-honey-300">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-honey-100 text-xl">{achievement.icon}</span>
        <div>
          <p className="font-display text-xs font-extrabold uppercase tracking-wider text-honey-700">Achievement unlocked</p>
          <p className="text-sm font-extrabold text-ink">{achievement.title}</p>
        </div>
      </div>
    </div>
  )
}