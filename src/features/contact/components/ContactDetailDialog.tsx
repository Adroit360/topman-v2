"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  contactStatusLabelMap,
  type ContactRecord,
  type ContactStatus,
} from "../types";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeStyle: "short",
});

export const ContactDetailDialog = ({
  submission,
  open,
  onOpenChange,
}: {
  submission: ContactRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-[-0.04em]">
            {submission.subject}
          </DialogTitle>
          <DialogDescription>
            Received {dateTimeFormatter.format(submission.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant={
                submission.status === "new"
                  ? "default"
                  : submission.status === "read"
                    ? "secondary"
                    : "outline"
              }
            >
              {contactStatusLabelMap[submission.status as ContactStatus] ??
                submission.status}
            </Badge>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex gap-2">
              <span className="w-16 shrink-0 text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">
                {submission.name}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="w-16 shrink-0 text-muted-foreground">Email</span>
              <a
                href={`mailto:${submission.email}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {submission.email}
              </a>
            </div>
            {submission.phone ? (
              <div className="flex gap-2">
                <span className="w-16 shrink-0 text-muted-foreground">
                  Phone
                </span>
                <span className="font-medium text-foreground">
                  {submission.phone}
                </span>
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Message
            </p>
            <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
              {submission.message}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
