"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BookRecord, PublisherSummary } from "@/features/catalog";
import { createBook } from "../services/createBook";
import { updateBook } from "../services/updateBook";
import { uploadBookCover } from "../services/uploadBookCover";
import {
  bookFormSchema,
  bookLevelOptions,
  bookTypeOptions,
  type BookFormValues,
} from "../types/book-form";
import { PublisherSearchSelect } from "./PublisherSearchSelect";

const emptyValues: BookFormValues = {
  title: "",
  level: "",
  type: "",
  price: 0,
  publisherId: "",
  isAvailable: true,
  imageUrl: undefined,
};

type PublisherOption = PublisherSummary & {
  archived?: boolean;
};

const buildPublisherOptions = ({
  publishers,
  book,
}: {
  publishers: PublisherSummary[];
  book?: BookRecord | null;
}): PublisherOption[] => {
  if (!book) {
    return publishers;
  }

  const existingPublisher = publishers.find(
    (publisher) => publisher.id === book.publisher.id,
  );

  if (existingPublisher) {
    return publishers;
  }

  return [
    {
      ...book.publisher,
      archived: true,
    },
    ...publishers,
  ];
};

export const BookFormDialog = ({
  mode,
  open,
  book,
  publishers,
  onOpenChange,
  onSuccess,
}: {
  mode: "create" | "edit";
  open: boolean;
  book?: BookRecord | null;
  publishers: PublisherSummary[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: emptyValues,
  });

  const publisherOptions = useMemo(
    () => buildPublisherOptions({ publishers, book }),
    [book, publishers],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setCoverFile(null);
    setCoverPreviewUrl(book?.image ?? null);

    form.reset(
      book
        ? {
            title: book.title,
            level: book.level,
            type: book.type,
            price: book.price,
            publisherId: book.publisherId,
            isAvailable: book.isAvailable,
            imageUrl: book.image ?? undefined,
          }
        : emptyValues,
    );
  }, [book, form, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset(emptyValues);
      if (coverPreviewUrl && coverPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
      setCoverFile(null);
      setCoverPreviewUrl(null);
    }

    onOpenChange(nextOpen);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (coverPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    setCoverFile(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleRemoveCover = () => {
    if (coverPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    setCoverFile(null);
    setCoverPreviewUrl(null);
    form.setValue("imageUrl", null);
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      let imageUrl: string | null | undefined = values.imageUrl;

      if (coverFile) {
        const fd = new FormData();
        fd.append("file", coverFile);
        const uploadResult = await uploadBookCover(fd);

        if (!uploadResult.success) {
          toast.error(uploadResult.message || "Cover image upload failed.");
          return;
        }

        imageUrl = uploadResult.data?.blobUrl ?? null;
      }

      const result =
        mode === "create"
          ? await createBook({ ...values, imageUrl })
          : await updateBook({
              id: book?.id,
              ...values,
              imageUrl,
            });

      if (result.fieldErrors) {
        for (const [fieldName, message] of Object.entries(result.fieldErrors)) {
          if (!message) {
            continue;
          }

          form.setError(fieldName as keyof BookFormValues, {
            type: "server",
            message,
          });
        }
      }

      if (result.success) {
        if (mode === "create") {
          toast.success(result.message || "Book added.");
        }

        onSuccess();
        handleOpenChange(false);
        form.reset(emptyValues);
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add book" : "Edit book"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new book record for the catalog."
              : "Update the selected book details used across the catalog."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <div className="-mx-6 max-h-[70vh] overflow-y-auto px-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Cover Image</FieldLabel>
                <FieldContent>
                  {coverPreviewUrl ? (
                    <div className="flex items-start gap-4">
                      <img
                        src={coverPreviewUrl}
                        alt="Book cover preview"
                        className="h-32 w-24 rounded-md border border-border object-cover"
                      />
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => coverFileInputRef.current?.click()}
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCover}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="flex h-32 w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-sm text-muted-foreground transition-colors hover:bg-muted/60"
                    >
                      <span className="flex flex-col items-center gap-2">
                        <UploadIcon className="size-5" />
                        Click to upload cover image
                      </span>
                    </button>
                  )}
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverFileChange}
                  />
                  <FieldDescription>
                    JPG, PNG, or WEBP, up to 10 MB.
                  </FieldDescription>
                </FieldContent>
              </Field>

              <Field
                data-invalid={form.formState.errors.title ? true : undefined}
              >
                <FieldLabel htmlFor={`${mode}-book-title`}>Title</FieldLabel>
                <FieldContent>
                  <Input
                    id={`${mode}-book-title`}
                    placeholder="Mathematics for JHS"
                    aria-invalid={
                      form.formState.errors.title ? true : undefined
                    }
                    {...form.register("title")}
                  />
                  <FieldError errors={[form.formState.errors.title]} />
                </FieldContent>
              </Field>

              <FieldGroup className="@md/field-group:grid @md/field-group:grid-cols-2">
                <Field
                  data-invalid={form.formState.errors.level ? true : undefined}
                >
                  <FieldLabel htmlFor={`${mode}-book-level`}>Level</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="level"
                      render={({ field, fieldState }) => (
                        <>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              id={`${mode}-book-level`}
                              className="w-full"
                              aria-invalid={fieldState.invalid}
                            >
                              <SelectValue placeholder="Choose level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {bookLevelOptions.map((levelOption) => (
                                  <SelectItem
                                    key={levelOption}
                                    value={levelOption}
                                  >
                                    {levelOption}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FieldError errors={[fieldState.error]} />
                        </>
                      )}
                    />
                  </FieldContent>
                </Field>

                <Field
                  data-invalid={form.formState.errors.type ? true : undefined}
                >
                  <FieldLabel htmlFor={`${mode}-book-type`}>Type</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="type"
                      render={({ field, fieldState }) => (
                        <>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              id={`${mode}-book-type`}
                              className="w-full"
                              aria-invalid={fieldState.invalid}
                            >
                              <SelectValue placeholder="Choose type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {bookTypeOptions.map((typeOption) => (
                                  <SelectItem
                                    key={typeOption}
                                    value={typeOption}
                                  >
                                    {typeOption}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FieldError errors={[fieldState.error]} />
                        </>
                      )}
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>

              <FieldGroup className="@md/field-group:grid @md/field-group:grid-cols-2">
                <Field
                  data-invalid={
                    form.formState.errors.publisherId ? true : undefined
                  }
                >
                  <FieldLabel>Publisher</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="publisherId"
                      render={({ field, fieldState }) => (
                        <>
                          <PublisherSearchSelect
                            options={publisherOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select publisher"
                            ariaInvalid={fieldState.invalid}
                          />
                          <FieldDescription>
                            Search by publisher name, reference, or author.
                          </FieldDescription>
                          <FieldError errors={[fieldState.error]} />
                        </>
                      )}
                    />
                  </FieldContent>
                </Field>

                <Field
                  data-invalid={
                    form.formState.errors.isAvailable ? true : undefined
                  }
                >
                  <FieldLabel>Availability</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="isAvailable"
                      render={({ field, fieldState }) => (
                        <>
                          <Select
                            value={String(field.value)}
                            onValueChange={(value) =>
                              field.onChange(value === "true")
                            }
                          >
                            <SelectTrigger
                              className="w-full"
                              aria-invalid={fieldState.invalid}
                            >
                              <SelectValue placeholder="Choose availability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="true">Available</SelectItem>
                                <SelectItem value="false">
                                  Unavailable
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FieldError errors={[fieldState.error]} />
                        </>
                      )}
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>

              <Field
                data-invalid={form.formState.errors.price ? true : undefined}
              >
                <FieldLabel htmlFor={`${mode}-book-price`}>Price</FieldLabel>
                <FieldContent>
                  <Input
                    id={`${mode}-book-price`}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="45"
                    aria-invalid={
                      form.formState.errors.price ? true : undefined
                    }
                    {...form.register("price", { valueAsNumber: true })}
                  />
                  {/* <FieldDescription>
                    Tags are generated automatically from the book title and
                    selected publisher.
                  </FieldDescription> */}
                  <FieldError errors={[form.formState.errors.price]} />
                </FieldContent>
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <div className="flex w-full items-center justify-end gap-2">
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
                    ? "Add book"
                    : "Save changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
