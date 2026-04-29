import Link from "next/link";
import { SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OrderNotFound() {
  return (
    <Card className="border-dashed border-border/70 bg-card/50">
      <CardHeader>
        <div className="flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/60 text-muted-foreground">
          <SearchXIcon />
        </div>
        <CardTitle>Order not found</CardTitle>
        <CardDescription>
          The order you tried to open does not exist or has been removed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link href="/dashboard/orders">Back to all orders</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
