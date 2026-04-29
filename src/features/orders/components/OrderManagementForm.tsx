"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateOrderAdminDetails } from "../services/updateOrderAdminDetails";
import {
  deliveryStatusOptions,
  type DeliveryStatusValue,
} from "../types/order";
import {
  orderAdminSchema,
  type OrderAdminFormValues,
  type UpdateOrderAdminResult,
} from "../types/order-admin-form";

const initialActionState: UpdateOrderAdminResult = {
  success: false,
  message: "",
};

export const OrderManagementForm = ({
  orderId,
  deliveryStatus,
  adminNotes,
}: {
  orderId: string;
  deliveryStatus: DeliveryStatusValue;
  adminNotes: string | null;
}) => {
  const [isPending, startTransition] = useTransition();
  const [actionState, setActionState] =
    useState<UpdateOrderAdminResult>(initialActionState);
  const form = useForm<OrderAdminFormValues>({
    resolver: zodResolver(orderAdminSchema),
    defaultValues: {
      orderId,
      deliveryStatus,
      adminNotes: adminNotes ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setActionState(initialActionState);

    startTransition(async () => {
      const result = await updateOrderAdminDetails({
        orderId: values.orderId,
        deliveryStatus: Number(values.deliveryStatus),
        adminNotes: values.adminNotes,
      });

      setActionState(result);

      if (result.fieldErrors) {
        for (const [fieldName, message] of Object.entries(result.fieldErrors)) {
          if (!message) {
            continue;
          }

          form.setError(fieldName as keyof OrderAdminFormValues, {
            type: "server",
            message,
          });
        }
      }

      if (result.success) {
        form.reset({
          orderId,
          deliveryStatus: values.deliveryStatus,
          adminNotes: result.data?.adminNotes ?? "",
        });
      }
    });
  });

  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="border-b border-border/60">
        <CardTitle>Admin controls</CardTitle>
        <CardDescription>
          Update delivery progress and save internal notes for the team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="deliveryStatus">Order status</FieldLabel>
              <FieldContent>
                <Controller
                  control={form.control}
                  name="deliveryStatus"
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        value={String(field.value)}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          id="deliveryStatus"
                          className="w-full"
                        >
                          <SelectValue placeholder="Choose status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {deliveryStatusOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Customers and the team should always see the latest
                        fulfilment state.
                      </FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </>
                  )}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="adminNotes">Admin notes</FieldLabel>
              <FieldContent>
                <Textarea
                  id="adminNotes"
                  placeholder="Optional notes for fulfilment, delivery updates, or follow-up items."
                  aria-invalid={
                    form.formState.errors.adminNotes ? true : undefined
                  }
                  {...form.register("adminNotes")}
                />
                <FieldDescription>
                  These notes stay internal and do not overwrite the customer
                  notes.
                </FieldDescription>
                <FieldError errors={[form.formState.errors.adminNotes]} />
              </FieldContent>
            </Field>
          </FieldGroup>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={
                actionState.success
                  ? "text-sm text-green-500"
                  : "text-sm text-muted-foreground"
              }
            >
              {actionState.message ||
                "Save changes when the order status or notes change."}
            </p>
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
