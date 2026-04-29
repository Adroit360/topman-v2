"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { submitContact } from "../actions/submitContact";
import { contactSchema } from "../schema/contact-schema";
import {
  initialContactResult,
  type ContactFieldName,
  type ContactFormValues,
  type ContactResult,
} from "../types";

export const useContactForm = () => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const [result, setResult] = useState<ContactResult>(initialContactResult);
  const [isPending, startTransition] = useTransition();

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = await form.trigger();

    if (!isValid) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    setResult(initialContactResult);

    startTransition(async () => {
      const nextResult = await submitContact(formData);

      setResult(nextResult);

      if (!nextResult.success) {
        const fieldErrors = nextResult.fieldErrors ?? {};

        for (const [fieldName, message] of Object.entries(fieldErrors)) {
          if (!message) continue;

          form.setError(fieldName as ContactFieldName, {
            type: "server",
            message,
          });
        }
      } else {
        form.reset();
      }
    });
  };

  return { form, isPending, result, submitForm };
};
