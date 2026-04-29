"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleCheckIcon, OctagonXIcon } from "lucide-react";
import { useUploadBookListForm } from "../hooks/useUploadBookListForm";

export const UploadBookListForm = () => {
  const {
    form: {
      register,
      formState: { errors },
    },
    isPending,
    result,
    submitForm,
  } = useUploadBookListForm();

  return (
    <Card className="rounded-[2rem] border border-border bg-background/95 shadow-sm">
      <CardHeader className="space-y-3 border-b border-border">
        <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
          Submit your book list
        </CardTitle>
        <CardDescription className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          Upload a PDF or clear image of your list and include your contact
          details so we can follow up.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="flex flex-col gap-6" onSubmit={submitForm} noValidate>
          {result.message ? (
            <Alert variant={result.success ? "success" : "destructive"}>
              {result.success ? <CircleCheckIcon /> : <OctagonXIcon />}
              <AlertTitle>
                {result.success ? "Upload complete" : "Submission failed"}
              </AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder="Your full name"
                  {...register("name")}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                <FieldError errors={[errors.name]} />
              </FieldContent>
            </Field>

            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <FieldContent>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="020 000 0000"
                    {...register("phone")}
                    aria-invalid={errors.phone ? "true" : "false"}
                  />
                  <FieldError errors={[errors.phone]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <FieldContent>
                  <Input
                    id="location"
                    placeholder="City or area"
                    {...register("location")}
                    aria-invalid={errors.location ? "true" : "false"}
                  />
                  <FieldError errors={[errors.location]} />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="file">Book list file</FieldLabel>
              <FieldContent>
                <Input
                  id="file"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  {...register("file")}
                  aria-invalid={errors.file ? "true" : "false"}
                />
                <FieldDescription>
                  Accepted formats: PDF, JPG, PNG, WEBP. Maximum size: 10 MB.
                </FieldDescription>
                <FieldError errors={[errors.file]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" className="px-6" disabled={isPending}>
              {isPending ? "Uploading..." : "Submit list"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
