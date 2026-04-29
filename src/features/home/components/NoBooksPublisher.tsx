import { LibraryBig } from "lucide-react";

export default function NoBooksPublisher() {
  return (
    <section className="px-4 pb-14 sm:px-6 sm:pb-18 lg:px-8 lg:pb-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-muted/40 px-6 py-16 text-center sm:px-10">
        <span className="flex size-14 items-center justify-center rounded-full border border-border bg-background shadow-sm">
          <LibraryBig className="size-6 text-muted-foreground" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-foreground">
          No catalog selections yet
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
          We could not find any publishers or books to feature right now. Add
          catalog data and this section will populate automatically.
        </p>
      </div>
    </section>
  );
}
