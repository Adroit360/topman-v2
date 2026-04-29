import {
  CheckCircle2Icon,
  Clock3Icon,
  CreditCardIcon,
  ShoppingBagIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currenctFormat } from "@/utils/currency-format";
import { type OrderStats } from "../types/order";

const statCards = [
  {
    key: "totalOrders",
    label: "Total orders",
    description: "All orders received across the store.",
    icon: ShoppingBagIcon,
  },
  {
    key: "pendingOrders",
    label: "Pending delivery",
    description: "Orders that still need fulfilment.",
    icon: Clock3Icon,
  },
  {
    key: "paidOrders",
    label: "Paid orders",
    description: "Orders with confirmed payments.",
    icon: CheckCircle2Icon,
  },
  {
    key: "totalRevenue",
    label: "Revenue collected",
    description: "Total paid revenue collected so far.",
    icon: CreditCardIcon,
  },
] as const;

export const OrdersStatsCards = ({ stats }: { stats: OrderStats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value =
          card.key === "totalRevenue"
            ? currenctFormat(stats.totalRevenue)
            : stats[card.key].toLocaleString();

        return (
          <Card key={card.key} className="border-border/70 bg-card/80">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="text-3xl tracking-[-0.04em]">
                    {value}
                  </CardTitle>
                </div>
                <span className="rounded-full border border-border/70 bg-muted/60 p-2 text-muted-foreground">
                  <Icon />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
