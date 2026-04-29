import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <div className="flex flex-col gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((__, nestedIndex) => (
                  <Skeleton className="h-10 w-full" key={nestedIndex} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((__, nestedIndex) => (
                  <Skeleton className="h-10 w-full" key={nestedIndex} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
