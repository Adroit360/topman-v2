import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PublisherSummary } from "@/features/catalog";
import { Edit2, Trash2 } from "lucide-react";

export const PublishersTable = ({
  publishers,
  onEdit,
  onDelete,
}: {
  publishers: PublisherSummary[];
  onEdit: (publisher: PublisherSummary) => void;
  onDelete: (publisher: PublisherSummary) => void;
}) => {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="border-b border-border/60">
        <CardTitle>Publishers</CardTitle>
        <CardDescription>
          Manage every publisher record used across the catalog.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Authors</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishers.map((publisher) => (
              <TableRow key={publisher.id}>
                <TableCell className="font-medium capitalize">
                  {publisher.name}
                </TableCell>
                <TableCell className="text-muted-foreground capitalize">
                  {publisher.reference}
                </TableCell>
                <TableCell className="text-muted-foreground capitalize">
                  {publisher.authors.length > 0
                    ? publisher.authors.map((author) => author.name).join(", ")
                    : publisher.author}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-yellow-400/10 text-yellow-500"
                      onClick={() => onEdit(publisher)}
                      aria-label={`Edit ${publisher.name}`}
                      title={`Edit ${publisher.name}`}
                    >
                      <Edit2 />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => onDelete(publisher)}
                      aria-label={`Delete ${publisher.name}`}
                      title={`Delete ${publisher.name}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
