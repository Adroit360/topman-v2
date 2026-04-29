"use client";

import { CircleCheckIcon, OctagonXIcon } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCheckoutForm } from "../hooks/useCheckoutForm";

export const CheckoutForm = () => {
  const {
    form: {
      register,
      formState: { errors },
    },
    isPending,
    result,
    pendingPayment,
    resumePendingPayment,
    submitCheckout,
  } = useCheckoutForm();

  return (
    <Card className="rounded-[2rem] border border-border bg-background/95 shadow-sm">
      <CardHeader className="space-y-3 border-b border-border">
        <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
          Checkout details
        </CardTitle>
        <CardDescription className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          Add your delivery and contact details, then continue to the secure
          Paystack payment page.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form
          className="flex flex-col gap-6"
          onSubmit={submitCheckout}
          noValidate
        >
          {result.message ? (
            <Alert variant={result.success ? "success" : "destructive"}>
              {result.success ? <CircleCheckIcon /> : <OctagonXIcon />}
              <AlertTitle>
                {result.success ? "Payment ready" : "Checkout issue"}
              </AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup>
            <div className="grid gap-6 md:grid-cols-2">
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
            </div>

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
                    placeholder="School, city, or delivery area"
                    {...register("location")}
                    aria-invalid={errors.location ? "true" : "false"}
                  />
                  <FieldError errors={[errors.location]} />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <FieldContent>
                <textarea
                  id="notes"
                  rows={5}
                  placeholder="Optional delivery notes, school name, or landmarks"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...register("notes")}
                  aria-invalid={errors.notes ? "true" : "false"}
                />
                <FieldDescription>
                  Optional. Add anything helpful for delivery or order handling.
                </FieldDescription>
                <FieldError errors={[errors.notes]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          {pendingPayment ? (
            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
              <p>
                A pending payment session already exists for this checkout. You
                can resume it without creating a duplicate order.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="submit"
              className="rounded-md px-6"
              disabled={isPending}
            >
              {isPending
                ? "Preparing payment..."
                : pendingPayment
                  ? "Resume Paystack Payment"
                  : "Pay Now"}
            </Button>
            {pendingPayment ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-6"
                onClick={resumePendingPayment}
                disabled={isPending}
              >
                Resume Pending Payment
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
