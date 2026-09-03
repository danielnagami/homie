import { Link, Outlet } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white">
      <header className="border-brand-100 sticky top-0 z-40 border-b bg-white/95 px-4 py-3 backdrop-blur">
        <Link to="/" className="font-display text-brand-600 text-2xl font-extrabold">
          Homie
        </Link>
      </header>
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
