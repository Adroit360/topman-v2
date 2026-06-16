import Link from "next/link";
import { ArrowRight } from "lucide-react";

type CategorySectionHeaderProps = {
  title: string;
  link: string;
};

export default function CategorySectionHeader({ title, link }: CategorySectionHeaderProps) {
  return (
    <div className="mb-5 flex w-full items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
      <div className="min-w-0">
        <h2 className="truncate text-xl sm:text-2xl font-semibold text-slate-950 capitalize md:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">A polished shelf of selected titles.</p>
      </div>

      <Link href={link} aria-label={`View all ${title}`} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-orange-500 font-semibold shadow-sm ring-1 ring-black/[0.06] transition duration-300 hover:text-orange-600">
        <span className="hidden sm:inline">View All</span>
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
