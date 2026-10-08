import { Link } from 'react-router'
import { ComparisonListItem } from '../components/ComparisonListItem'
import { EntryForm } from '../components/EntryForm'
import { Stepper } from '../components/Stepper'
import { useRecentComparisons } from '../hooks/useComparison'

export function ComparePage() {
  const { data: recent } = useRecentComparisons()

  return (
    <div className="space-y-10">
      <div className="space-y-8">
        <header className="space-y-4">
          <Stepper current={1} />
          <h1 className="text-3xl">Comparar</h1>
          <p className="mt-2 text-muted">
            Cole um print das ofertas e veja o ranking pela taxa líquida, com alertas de liquidez, FGC e
            concentração.
          </p>
        </header>

        <EntryForm />
      </div>

      {recent && recent.length > 0 && (
        <section aria-labelledby="recent-title" className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 id="recent-title" className="text-xl">
              Últimas comparações
            </h2>
            <Link to="/historico" className="text-sm text-gold hover:text-gold-hover">
              Ver todas
            </Link>
          </div>
          <ul className="space-y-3">
            {recent.map((comparison) => (
              <ComparisonListItem key={comparison.id} comparison={comparison} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
