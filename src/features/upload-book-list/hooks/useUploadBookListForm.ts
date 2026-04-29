"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { submitBookList } from "../services/submitBookList";
import {
  initialSubmitBookListResult,
  type SubmitBookListResult,
  type UploadBookListFieldName,
  type UploadBookListFormValues,
  uploadBookListClientSchema,
} from "../types/upload";

export const useUploadBookListForm = () => {
  const form = useForm<UploadBookListFormValues>({
    resolver: zodResolver(uploadBookListClientSchema),
    defaultValues: {
      name: "",
      phone: "",
      location: "",
    },
  });
  const [result, setResult] = useState<SubmitBookListResult>(
    initialSubmitBookListResult,
  );
  const [isPending, startTransition] = useTransition();

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    const isValid = await form.trigger();

    if (!isValid) {
      return;
    }

    const formData = new FormData(formElement);

    setResult(initialSubmitBookListResult);

    startTransition(async () => {
      const nextResult = await submitBookList(formData);

      setResult(nextResult);

      if (!nextResult.success) {
        const fieldErrors = nextResult.fieldErrors ?? {};

        for (const [fieldName, message] of Object.entries(fieldErrors)) {
          if (!message) {
            continue;
          }

          form.setError(fieldName as UploadBookListFieldName, {
            type: "server",
            message,
          });
        }

        return;
      }

      form.reset();
      formElement.reset();
    });
  };

  return {
    form,
    isPending,
    result,
    submitForm,
  };
};
