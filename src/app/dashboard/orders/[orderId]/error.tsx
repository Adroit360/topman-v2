"use client";

import { useEffect } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OrderDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <div className="flex size-12 items-center justify-center rounded-full border border-destructive/30 bg-background text-destructive">
          <AlertTriangleIcon />
        </div>
        <CardTitle>We could not load this order</CardTitle>
        <CardDescription>
          Retry the request. If it still fails, inspect the server logs for the
          failing query.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={reset} variant="outline">
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
