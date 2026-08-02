export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="eyebrow">{eyebrow}</div><h1 className="mt-3 text-3xl font-medium tracking-[-.035em] md:text-4xl">{title}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#858b96]">{description}</p></div>{action}</div>;
}
