interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="flex flex-col items-center gap-4 px-4 pt-12 text-center">
      <h1 className="font-display text-2xl font-bold text-slate-800">{title}</h1>
      <p className="max-w-xs text-sm leading-relaxed text-slate-500">{description}</p>
    </section>
  )
}
