import { BarChart3, History, Scale, UserRound, type LucideIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'

const items: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Comparar', icon: Scale },
  { to: '/carteira', label: 'Carteira', icon: BarChart3 },
  { to: '/historico', label: 'Histórico', icon: History },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
]

function Brand() {
  return (
    <span className="font-display text-xl tracking-tight">
      Help <span className="text-gold">Invest</span>
    </span>
  )
}

export function AppLayout() {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      {/* Desktop: navegação lateral */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-border bg-surface px-4 py-6 md:flex">
        <div className="px-2">
          <Brand />
        </div>
        <nav className="flex flex-col gap-1" aria-label="Principal">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-surface-2 text-gold'
                    : 'text-muted hover:bg-surface-2 hover:text-text'
                }`
              }
            >
              <Icon className="size-[1.125rem]" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobile: topo com a marca */}
        <header className="flex items-center border-b border-border px-4 py-3 md:hidden">
          <Brand />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 md:px-8 md:py-10 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile: navegação inferior */}
      <nav
        className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Principal"
      >
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[0.7rem] ${isActive ? 'text-gold' : 'text-muted'}`
            }
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
