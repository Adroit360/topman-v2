import Link from "next/link";
import { PackageSearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const OrdersEmptyState = ({
  title = "No orders yet",
  description = "New orders will appear here once customers begin checking out.",
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <Card className="border-dashed border-border/70 bg-card/50">
      <CardHeader>
        <div className="flex size-12 items-center justify-center rounded-full border border-border/60 bg-muted/60 text-muted-foreground">
          <PackageSearchIcon />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link href="/">Return to storefront</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
