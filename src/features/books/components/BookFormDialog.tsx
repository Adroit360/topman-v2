"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadIcon, XIcon } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BookRecord, PublisherSummary } from "@/features/catalog";
import { createBook } from "../services/createBook";
import { updateBook } from "../services/updateBook";
import { uploadBookCover } from "../services/uploadBookCover";
import { bookFormSchema, bookLevelOptions, bookTypeOptions, type BookFormValues } from "../types/book-form";
import { PublisherSearchSelect } from "./PublisherSearchSelect";

const emptyValues: BookFormValues = {
  title: "",
  level: "",
  type: "",
  tags: [],
  price: 0,
  publisherId: "",
  isAvailable: true,
  imageUrl: undefined,
};

type PublisherOption = PublisherSummary & {
  archived?: boolean;
};

const buildPublisherOptions = ({ publishers, book }: { publishers: PublisherSummary[]; book?: BookRecord | null }): PublisherOption[] => {
  if (!book) {
    return publishers;
  }

  const existingPublisher = publishers.find((publisher) => publisher.id === book.publisher.id);

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

const normalizeTagValue = (value: string) => value.trim();

const appendTags = (currentTags: string[], rawValue: string) => {
  const nextTags = [...currentTags];
  const existingTags = new Set(currentTags.map((tag) => tag.toLowerCase()));

  for (const segment of rawValue.split(",")) {
    const normalizedTag = normalizeTagValue(segment);
    const normalizedKey = normalizedTag.toLowerCase();

    if (!normalizedTag || existingTags.has(normalizedKey)) {
      continue;
    }

    existingTags.add(normalizedKey);
    nextTags.push(normalizedTag);
  }

  return nextTags;
};

const cropAspectRatio = 3 / 4;

const createImageElement = (source: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not load the selected image.")));
    image.src = source;
  });

const cropImageFile = async ({
  imageSrc,
  cropAreaPixels,
  fileName,
  mimeType,
}: {
  imageSrc: string;
  cropAreaPixels: Area;
  fileName: string;
  mimeType: string;
}) => {
  const image = await createImageElement(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare the cropped image.");
  }

  const width = Math.max(1, Math.round(cropAreaPixels.width));
  const height = Math.max(1, Math.round(cropAreaPixels.height));

  canvas.width = width;
  canvas.height = height;

  context.drawImage(
    image,
    cropAreaPixels.x,
    cropAreaPixels.y,
    cropAreaPixels.width,
    cropAreaPixels.height,
    0,
    0,
    width,
    height,
  );

  const outputType = ["image/jpeg", "image/png", "image/webp"].includes(mimeType) ? mimeType : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((generatedBlob) => {
      if (!generatedBlob) {
        reject(new Error("Could not generate the cropped image."));
        return;
      }

      resolve(generatedBlob);
    }, outputType);
  });

  return new File([blob], fileName, {
    type: outputType,
    lastModified: Date.now(),
  });
};

export const BookFormDialog = ({ mode, open, book, publishers, onOpenChange, onSuccess }: { mode: "create" | "edit"; open: boolean; book?: BookRecord | null; publishers: PublisherSummary[]; onOpenChange: (open: boolean) => void; onSuccess: () => void }) => {
  const [isPending, startTransition] = useTransition();
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCroppingImage, setIsCroppingImage] = useState(false);
  const [tagInputValue, setTagInputValue] = useState("");
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: emptyValues,
  });
  const tags = form.watch("tags");

  const publisherOptions = useMemo(() => buildPublisherOptions({ publishers, book }), [book, publishers]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCoverFile(null);
    setCoverPreviewUrl(book?.image ?? null);
    setIsCropDialogOpen(false);
    setCropSourceFile(null);
    setCropSourceUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setTagInputValue("");

    form.reset(
      book
        ? {
            title: book.title,
            level: book.level,
            type: book.type,
            tags: book.tags,
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
      if (cropSourceUrl) {
        URL.revokeObjectURL(cropSourceUrl);
      }
      setIsCropDialogOpen(false);
      setCropSourceFile(null);
      setCropSourceUrl(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setTagInputValue("");
    }

    onOpenChange(nextOpen);
  };

  const commitTags = (rawValue: string) => {
    const nextTags = appendTags(form.getValues("tags"), rawValue);

    form.setValue("tags", nextTags, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setTagInputValue("");
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) {
      return;
    }

    if (cropSourceUrl) {
      URL.revokeObjectURL(cropSourceUrl);
    }

    setCropSourceFile(file);
    setCropSourceUrl(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsCropDialogOpen(true);
  };

  const handleRemoveCover = () => {
    if (coverPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    setCoverFile(null);
    setCoverPreviewUrl(null);
    form.setValue("imageUrl", null);
  };

  const handleCropDialogOpenChange = (nextOpen: boolean) => {
    setIsCropDialogOpen(nextOpen);

    if (!nextOpen && !isCroppingImage) {
      if (cropSourceUrl) {
        URL.revokeObjectURL(cropSourceUrl);
      }

      setCropSourceFile(null);
      setCropSourceUrl(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  };

  const handleConfirmCrop = async () => {
    if (!cropSourceFile || !cropSourceUrl || !croppedAreaPixels) {
      toast.error("Adjust the crop area before continuing.");
      return;
    }

    setIsCroppingImage(true);

    try {
      const croppedFile = await cropImageFile({
        imageSrc: cropSourceUrl,
        cropAreaPixels: croppedAreaPixels,
        fileName: cropSourceFile.name,
        mimeType: cropSourceFile.type,
      });
      const previewUrl = URL.createObjectURL(croppedFile);

      if (coverPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreviewUrl);
      }

      setCoverFile(croppedFile);
      setCoverPreviewUrl(previewUrl);
      form.setValue("imageUrl", previewUrl, {
        shouldDirty: true,
        shouldTouch: true,
      });
      handleCropDialogOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not crop the selected image.");
    } finally {
      setIsCroppingImage(false);
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const finalTags = appendTags(values.tags, tagInputValue);
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
          ? await createBook({ ...values, tags: finalTags, imageUrl })
          : await updateBook({
              id: book?.id,
              ...values,
              tags: finalTags,
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
          <DialogTitle>{mode === "create" ? "Add book" : "Edit book"}</DialogTitle>
          <DialogDescription>{mode === "create" ? "Create a new book record for the catalog." : "Update the selected book details used across the catalog."}</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <div className="-mx-6 max-h-[70vh] overflow-y-auto px-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Cover Image</FieldLabel>
                <FieldContent>
                  {coverPreviewUrl ? (
                    <div className="flex items-start gap-4">
                      <img src={coverPreviewUrl} alt="Book cover preview" className="h-32 w-24 rounded-md border border-border object-cover" />
                      <div className="flex flex-col gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => coverFileInputRef.current?.click()}>
                          Change
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={handleRemoveCover}>
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
                  <input ref={coverFileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverFileChange} />
                  <FieldDescription>JPG, PNG, or WEBP, up to 10 MB.</FieldDescription>
                </FieldContent>
              </Field>

              <Field data-invalid={form.formState.errors.title ? true : undefined}>
                <FieldLabel htmlFor={`${mode}-book-title`}>Title</FieldLabel>
                <FieldContent>
                  <Input id={`${mode}-book-title`} placeholder="Mathematics for JHS" aria-invalid={form.formState.errors.title ? true : undefined} {...form.register("title")} />
                  <FieldError errors={[form.formState.errors.title]} />
                </FieldContent>
              </Field>

              <FieldGroup className="@md/field-group:grid @md/field-group:grid-cols-2">
                <Field data-invalid={form.formState.errors.level ? true : undefined}>
                  <FieldLabel htmlFor={`${mode}-book-level`}>Level</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="level"
                      render={({ field, fieldState }) => (
                        <>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id={`${mode}-book-level`} className="w-full" aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Choose level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {bookLevelOptions.map((levelOption) => (
                                  <SelectItem key={levelOption} value={levelOption}>
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

                <Field data-invalid={form.formState.errors.type ? true : undefined}>
                  <FieldLabel htmlFor={`${mode}-book-type`}>Type</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="type"
                      render={({ field, fieldState }) => (
                        <>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id={`${mode}-book-type`} className="w-full" aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Choose type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {bookTypeOptions.map((typeOption) => (
                                  <SelectItem key={typeOption} value={typeOption}>
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

              <Field data-invalid={form.formState.errors.tags ? true : undefined}>
                <FieldLabel htmlFor={`${mode}-book-tags`}>Tags</FieldLabel>
                <FieldContent>
                  <div className="rounded-xl border border-input bg-background px-3 py-3 shadow-xs transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
                    {tags.length > 0 ? (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="h-7 gap-1.5 rounded-full px-2.5 text-xs font-medium">
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => {
                                form.setValue(
                                  "tags",
                                  tags.filter((existingTag) => existingTag !== tag),
                                  {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: true,
                                  },
                                );
                              }}
                              className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
                              aria-label={`Remove ${tag} tag`}
                            >
                              <XIcon className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : null}

                    <Input
                      id={`${mode}-book-tags`}
                      value={tagInputValue}
                      onChange={(event) => {
                        const nextValue = event.target.value;

                        if (nextValue.includes(",")) {
                          commitTags(nextValue);
                          return;
                        }

                        setTagInputValue(nextValue);
                      }}
                      onBlur={() => {
                        if (normalizeTagValue(tagInputValue)) {
                          commitTags(tagInputValue);
                        }
                      }}
                      onKeyDown={(event) => {
                        if ((event.key === "Enter" || event.key === ",") && normalizeTagValue(tagInputValue)) {
                          event.preventDefault();
                          commitTags(tagInputValue);
                        }
                      }}
                      placeholder="fiction, children, story book"
                      className="h-auto border-0 px-0 py-0 text-sm shadow-none focus-visible:ring-0"
                      aria-invalid={form.formState.errors.tags ? true : undefined}
                    />
                  </div>
                  <FieldDescription>Type a tag and press comma to add it. Duplicate and empty tags are ignored.</FieldDescription>
                  <FieldError errors={[form.formState.errors.tags]} />
                </FieldContent>
              </Field>

              <FieldGroup className="@md/field-group:grid @md/field-group:grid-cols-2">
                <Field data-invalid={form.formState.errors.publisherId ? true : undefined}>
                  <FieldLabel>Publisher</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="publisherId"
                      render={({ field, fieldState }) => (
                        <>
                          <PublisherSearchSelect options={publisherOptions} value={field.value} onChange={field.onChange} placeholder="Select publisher" ariaInvalid={fieldState.invalid} />
                          <FieldDescription>Search by publisher name, reference, or author.</FieldDescription>
                          <FieldError errors={[fieldState.error]} />
                        </>
                      )}
                    />
                  </FieldContent>
                </Field>

                <Field data-invalid={form.formState.errors.isAvailable ? true : undefined}>
                  <FieldLabel>Availability</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="isAvailable"
                      render={({ field, fieldState }) => (
                        <>
                          <Select value={String(field.value)} onValueChange={(value) => field.onChange(value === "true")}>
                            <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                              <SelectValue placeholder="Choose availability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="true">Available</SelectItem>
                                <SelectItem value="false">Unavailable</SelectItem>
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

              <Field data-invalid={form.formState.errors.price ? true : undefined}>
                <FieldLabel htmlFor={`${mode}-book-price`}>Price</FieldLabel>
                <FieldContent>
                  <Input id={`${mode}-book-price`} type="number" min="0" step="1" placeholder="45" aria-invalid={form.formState.errors.price ? true : undefined} {...form.register("price", { valueAsNumber: true })} />
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
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? (mode === "create" ? "Saving..." : "Updating...") : mode === "create" ? "Add book" : "Save changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog open={isCropDialogOpen} onOpenChange={handleCropDialogOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop cover image</DialogTitle>
            <DialogDescription>Adjust the crop area before saving the book cover. The cropped image will be used for preview and upload.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            <div className="relative h-[360px] overflow-hidden rounded-2xl border border-border bg-muted/40">
              {cropSourceUrl ? (
                <Cropper
                  image={cropSourceUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={cropAspectRatio}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                  objectFit="contain"
                  showGrid={false}
                />
              ) : null}
            </div>

            <div className="rounded-xl border border-border bg-card/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Zoom</p>
                  <p className="text-xs text-muted-foreground">Fine-tune the visible area of the book cover.</p>
                </div>
                <span className="min-w-10 text-right text-xs font-medium text-muted-foreground">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="mt-3 w-full accent-orange-600"
                aria-label="Crop image zoom"
              />
            </div>
          </div>

          <DialogFooter>
            <div className="flex w-full items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleCropDialogOpenChange(false)} disabled={isCroppingImage}>
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirmCrop} disabled={isCroppingImage}>
                {isCroppingImage ? "Applying crop..." : "Use cropped image"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
