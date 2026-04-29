import Link from "next/link";

type CategorySectionHeaderProps = {
  title: string;
  link: string;
};

export default function CategorySectionHeader({
  title,
  link,
}: CategorySectionHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      <div className="flex items-center space-x-4">
        <div className="w-2 h-12 bg-amber-500 rounded" />
        <h2 className="text-3xl font-bold capitalize">{title}</h2>
      </div>

      <Link
        href={link}
        aria-label={`View all ${title}`}
        className="inline-flex items-center text-amber-500 hover:text-amber-600"
      >
        <span className="hidden text-lg font-medium sm:inline">View All</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 sm:hidden"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
