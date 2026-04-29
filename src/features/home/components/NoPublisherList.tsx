export default function NoPublisherList() {
  return (
    <section className="px-4 pb-14 sm:px-6 sm:pb-18 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-dashed border-border bg-muted/40 px-6 py-14 text-center sm:px-10">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
          No featured publisher groups available
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
          Publishers were found, but there are no books ready to display in this
          section yet.
        </p>
      </div>
    </section>
  );
}
