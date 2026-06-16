"use client";

import { useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { PublisherSummary } from "@/features/catalog";
import { createPublisher } from "../services/createPublisher";
import { updatePublisher } from "../services/updatePublisher";
import {
  publisherFormSchema,
  type PublisherFormValues,
} from "../types/publisher-form";

const emptyValues: PublisherFormValues = {
  name: "",
  reference: "",
  authors: [""],
};

export const PublisherFormDialog = ({
  mode,
  open,
  publisher,
  onOpenChange,
  onSuccess,
}: {
  mode: "create" | "edit";
  open: boolean;
  publisher?: PublisherSummary | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<PublisherFormValues>({
    resolver: zodResolver(publisherFormSchema),
    defaultValues: emptyValues,
  });
  const authors =
    useWatch({
      control: form.control,
      name: "authors",
    }) ?? emptyValues.authors;
  const authorFieldErrors = Array.isArray(form.formState.errors.authors)
    ? form.formState.errors.authors
    : [];

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(
      publisher
        ? {
            name: publisher.name,
            reference: publisher.reference,
            authors:
              publisher.authors.length > 0
                ? publisher.authors.map((author) => author.name)
                : [publisher.author],
          }
        : emptyValues,
    );
  }, [form, open, publisher]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset(emptyValues);
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createPublisher(values)
          : await updatePublisher({
              id: publisher?.id,
              ...values,
            });

      if (result.fieldErrors) {
        for (const [fieldName, message] of Object.entries(result.fieldErrors)) {
          if (!message) {
            continue;
          }

          form.setError(fieldName as keyof PublisherFormValues, {
            type: "server",
            message,
          });
        }
      }

      if (result.success) {
        if (mode === "create") {
          toast.success(result.message || "Publisher added.");
        }

        onSuccess();
        handleOpenChange(false);
        form.reset(emptyValues);
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add publisher" : "Edit publisher"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new publisher record for the catalog."
              : "Update the selected publisher details used across the catalog."}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={form.formState.errors.name ? true : undefined}>
              <FieldLabel htmlFor={`${mode}-publisher-name`}>
                Publisher name
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`${mode}-publisher-name`}
                  placeholder="Cassava Republic"
                  aria-invalid={form.formState.errors.name ? true : undefined}
                  {...form.register("name")}
                />
                <FieldDescription>
                  Use the display name customers should see in the catalog.
                </FieldDescription>
                <FieldError errors={[form.formState.errors.name]} />
              </FieldContent>
            </Field>
            <Field
              data-invalid={form.formState.errors.reference ? true : undefined}
            >
              <FieldLabel htmlFor={`${mode}-publisher-reference`}>
                Reference
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`${mode}-publisher-reference`}
                  placeholder="CR-001"
                  aria-invalid={
                    form.formState.errors.reference ? true : undefined
                  }
                  {...form.register("reference")}
                />
                <FieldDescription>
                  Keep the internal reference consistent with your catalog data.
                </FieldDescription>
                <FieldError errors={[form.formState.errors.reference]} />
              </FieldContent>
            </Field>
            <Field data-invalid={form.formState.errors.authors ? true : undefined}>
              <FieldLabel>Authors</FieldLabel>
              <FieldContent>
                <div className="flex flex-col gap-3">
                  {authors.map((_, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Input
                        id={`${mode}-publisher-author-${index}`}
                        placeholder="Author name"
                        aria-invalid={
                          form.formState.errors.authors?.[index]
                            ? true
                            : undefined
                        }
                        {...form.register(`authors.${index}`)}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          if (authors.length === 1) {
                            form.setValue("authors.0", "", {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });
                            return;
                          }

                          form.setValue(
                            "authors",
                            authors.filter((_, authorIndex) => authorIndex !== index),
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            },
                          );
                        }}
                        aria-label="Remove author"
                        title="Remove author"
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  ))}
                </div>
                <FieldDescription>
                  Add every author tied to this publisher record.
                </FieldDescription>
                <FieldError
                  errors={[
                    form.formState.errors.authors,
                    ...authorFieldErrors,
                  ]}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    form.setValue("authors", [...authors, ""], {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <PlusIcon data-icon="inline-start" />
                  Add author
                </Button>
              </FieldContent>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div></div>

              {/* <p
                className={
                  actionState.success
                    ? "text-sm text-green-500"
                    : "text-sm text-muted-foreground"
                }
              >
                {actionState.message ||
                  (mode === "create"
                    ? "Save the publisher to make it available in the dashboard."
                    : "Update the publisher record and keep the catalog in sync.")}
              </p> */}
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button disabled={isPending} type="submit">
                  {isPending
                    ? mode === "create"
                      ? "Saving..."
                      : "Updating..."
                    : mode === "create"
                      ? "Add publisher"
                      : "Save changes"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
