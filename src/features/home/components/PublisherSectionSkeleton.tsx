export const PublisherSectionSkeleton = () => {
  return (
    <section className="px-4 pb-14 sm:px-6 sm:pb-18 lg:px-8 lg:pb-24">
      <div className="grid grid-cols-1 gap-x-0 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-96 animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
    </section>
  );
};
