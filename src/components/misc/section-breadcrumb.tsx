import { PageBreadcrumbProps } from "./types/page-breadcrumb";

export default function SectionBread({
  title,
  description,
}: PageBreadcrumbProps) {
  return (
    <div className="relative w-full bg-amber-500 -mt-20 mb-10 rounded-b-[2rem]">
      <div className="px-34 pt-40 pb-16 flex flex-col items-start gap-4">
        <div className="text-5xl font-bold ">{title}</div>
        <div className="text-lg">{description}</div>
      </div>
    </div>
  );
}
