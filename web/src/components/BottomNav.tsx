import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Home', icon: '🏡', end: true },
  { to: '/leaderboard', label: 'Ranks', icon: '🏆' },
  { to: '/profile', label: 'Profile', icon: '🎖️' },
]

export function BottomNav() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-5 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <nav className="pointer-events-auto mx-auto flex max-w-[360px] items-center justify-between rounded-full border border-white/80 bg-white/95 p-2 shadow-nav backdrop-blur-xl">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 rounded-full px-2 font-display text-[10px] font-extrabold transition-all active:scale-95 ${
                isActive
                  ? 'scale-105 bg-coral-100 text-coral-700 shadow-[0_3px_0_rgba(132,36,21,0.18)]'
                  : 'text-pebble'
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
