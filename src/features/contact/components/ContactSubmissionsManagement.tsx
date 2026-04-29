"use client";

import { useMemo, useState } from "react";
import { ContactDetailDialog } from "./ContactDetailDialog";
import { ContactSubmissionsTable } from "./ContactSubmissionsTable";
import type { ContactRecord } from "../types";

export const ContactSubmissionsManagement = ({
  submissions,
}: {
  submissions: ContactRecord[];
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSubmission = useMemo(
    () => submissions.find((s) => s.id === selectedId) ?? null,
    [submissions, selectedId],
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex max-w-3xl flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Contact workspace
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
            Contact submissions
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Review messages submitted through the public contact form and follow
            up with customers.
          </p>
        </div>
      </section>

      {submissions.length > 0 ? (
        <ContactSubmissionsTable
          submissions={submissions}
          onView={(submission) => setSelectedId(submission.id)}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">
              No messages yet
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Messages submitted via the public contact form will appear here.
            </p>
          </div>
        </div>
      )}

      <ContactDetailDialog
        submission={selectedSubmission}
        open={Boolean(selectedSubmission)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
};
