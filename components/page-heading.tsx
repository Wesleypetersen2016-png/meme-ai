export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="eyebrow acid">{eyebrow}</div><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] md:text-4xl">{title}</h1><p className="mt-2 max-w-xl text-sm text-[#838a83]">{description}</p></div>{action}</div>;
}
