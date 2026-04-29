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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  contactStatusLabelMap,
  type ContactRecord,
  type ContactStatus,
} from "../types";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusVariantMap: Record<
  ContactStatus,
  "default" | "secondary" | "outline"
> = {
  new: "default",
  read: "secondary",
  replied: "outline",
};

export const ContactSubmissionsTable = ({
  submissions,
  onView,
}: {
  submissions: ContactRecord[];
  onView: (submission: ContactRecord) => void;
}) => {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="border-b border-border/60">
        <CardTitle>Contact Submissions</CardTitle>
        <CardDescription>
          Messages submitted via the contact page, sorted by newest first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">{submission.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {submission.email}
                </TableCell>
                <TableCell className="max-w-48 truncate">
                  {submission.subject}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      statusVariantMap[submission.status as ContactStatus] ??
                      "secondary"
                    }
                  >
                    {contactStatusLabelMap[
                      submission.status as ContactStatus
                    ] ?? submission.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dateTimeFormatter.format(submission.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(submission)}
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
