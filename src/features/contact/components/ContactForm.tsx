"use client";

import { CircleCheckIcon, OctagonXIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContactForm } from "../hooks/useContactForm";

export const ContactForm = () => {
  const {
    form: {
      register,
      formState: { errors },
    },
    isPending,
    result,
    submitForm,
  } = useContactForm();

  return (
    <form className="flex flex-col gap-6" onSubmit={submitForm} noValidate>
      {result.message ? (
        <Alert variant={result.success ? "success" : "destructive"}>
          {result.success ? <CircleCheckIcon /> : <OctagonXIcon />}
          <AlertTitle>
            {result.success ? "Message sent" : "Submission failed"}
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
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              <FieldError errors={[errors.email]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">
              Phone{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
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
        </div>

        <Field>
          <FieldLabel htmlFor="subject">Subject</FieldLabel>
          <FieldContent>
            <Input
              id="subject"
              placeholder="What is this about?"
              {...register("subject")}
              aria-invalid={errors.subject ? "true" : "false"}
            />
            <FieldError errors={[errors.subject]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="message">Message</FieldLabel>
          <FieldContent>
            <Textarea
              id="message"
              placeholder="Tell us how we can help..."
              className="min-h-32"
              {...register("message")}
              aria-invalid={errors.message ? "true" : "false"}
            />
            <FieldDescription>
              We aim to respond within 1–2 business days.
            </FieldDescription>
            <FieldError errors={[errors.message]} />
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" className="px-6" disabled={isPending}>
          {isPending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
};
