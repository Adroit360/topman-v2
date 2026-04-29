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

export default function OrdersError({
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
        <CardTitle>We could not load the orders workspace</CardTitle>
        <CardDescription>
          Try the request again. If the problem persists, inspect the server
          logs.
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
