import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

const iconClass = 'h-6 w-6'
const baseClass =
  'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition-colors'
const activeClass = 'text-brand-600'
const inactiveClass = 'text-slate-400'

const items: NavItem[] = [
  {
    to: '/',
    label: 'Today',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={iconClass}
      >
        <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/leaderboard',
    label: 'Leaderboard',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={iconClass}
      >
        <path
          d="M8 21h8m-4-4v4m-7-9h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M5 5V3h14v2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/household',
    label: 'Household',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={iconClass}
      >
        <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={iconClass}
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav className="border-brand-100 shadow-nav fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
