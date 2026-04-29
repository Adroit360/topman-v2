"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ListOrderRecord } from "../types/list-order";
import { ListOrderStatusBadge } from "./ListOrderStatusBadge";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const isImageFile = (contentType: string) => contentType.startsWith("image/");

export const ListOrdersTable = ({
  orders,
  onView,
}: {
  orders: ListOrderRecord[];
  onView: (order: ListOrderRecord) => void;
}) => {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="border-b border-border/60">
        <CardTitle>Book List Orders</CardTitle>
        <CardDescription>
          Uploaded list requests sorted by newest first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {isImageFile(order.contentType) ? (
                    <img
                      src={order.blobUrl}
                      alt={order.fileName}
                      className="size-12 rounded-md border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-md border border-border text-xs text-muted-foreground">
                      PDF
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">
                      {order.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.location}
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1 text-sm text-muted-foreground">
                    {order.fileName}
                  </span>
                </TableCell>
                <TableCell>
                  <ListOrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dateTimeFormatter.format(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(order)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
