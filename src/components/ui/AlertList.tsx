import { Info, OctagonAlert, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { Alert } from '@/lib/alerts'

const styles: Record<Alert['severity'], { icon: LucideIcon; classes: string; label: string }> = {
  INFO: { icon: Info, classes: 'border-info/30 bg-info/10 text-info', label: 'Informação' },
  WARNING: {
    icon: TriangleAlert,
    classes: 'border-warning/30 bg-warning/10 text-warning',
    label: 'Atenção',
  },
  DANGER: {
    icon: OctagonAlert,
    classes: 'border-danger/30 bg-danger/10 text-danger',
    label: 'Risco',
  },
}

/** Mostra `message`; `severity` define cor e ícone. `code` desconhecido não importa. */
export function AlertList({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null

  return (
    <ul className="space-y-2">
      {alerts.map((alert, index) => {
        const { icon: Icon, classes, label } = styles[alert.severity]

        return (
          <li
            key={`${alert.code}-${index}`}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${classes}`}
          >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="sr-only">{label}: </span>
              {alert.message}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
