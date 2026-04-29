export default function PublisherHeader() {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
        Publisher shelves
      </p>
      <h2 className="text-balance text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
        Browse a focused selection of publishers and the books readers reach for
        most.
      </h2>
      <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
        Each shelf highlights four standout books, with a final literature row
        gathering curated reading picks from across the wider catalog.
      </p>
    </div>
  );
}
