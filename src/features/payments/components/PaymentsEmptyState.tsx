import Link from "next/link";
import { ReceiptTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const PaymentsEmptyState = () => {
  return (
    <Card className="border-dashed border-border/70 bg-card/50">
      <CardHeader>
        <div className="flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/60 text-muted-foreground">
          <ReceiptTextIcon />
        </div>
        <CardTitle>No confirmed payments yet</CardTitle>
        <CardDescription>
          Payment receipts will appear here as soon as checkout payments are
          confirmed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link href="/dashboard/orders">Open orders workspace</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
