export function PagePlaceholder({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-2 text-muted">{hint}</p>
    </div>
  )
}
