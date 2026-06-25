"use client";

import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CircleCheckIcon, OctagonXIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { updateActivePaymentGateway } from "../services/paymentGatewaySettings";
import {
  paymentGatewayOptions,
  type PaymentGateway,
} from "../types/payment-gateway";

type PaymentGatewaySettingsFormValues = {
  gateway: PaymentGateway;
};

type PaymentGatewaySettingsActionState = {
  success: boolean;
  message: string;
  fieldErrors?: {
    gateway?: string;
  };
};

const initialActionState: PaymentGatewaySettingsActionState = {
  success: false,
  message: "",
};

export const PaymentGatewaySettingsForm = ({
  gateway,
}: {
  gateway: PaymentGateway;
}) => {
  const [isPending, startTransition] = useTransition();
  const [actionState, setActionState] =
    useState<PaymentGatewaySettingsActionState>(initialActionState);
  const form = useForm<PaymentGatewaySettingsFormValues>({
    defaultValues: {
      gateway,
    },
  });
  const selectedGateway = useWatch({
    control: form.control,
    name: "gateway",
  });

  const onSubmit = form.handleSubmit((values) => {
    setActionState(initialActionState);

    startTransition(async () => {
      const result = await updateActivePaymentGateway({
        gateway: values.gateway,
      });

      setActionState(result);

      if (result.fieldErrors?.gateway) {
        form.setError("gateway", {
          type: "server",
          message: result.fieldErrors.gateway,
        });
      }

      if (result.success && result.data) {
        form.reset({
          gateway: result.data.gateway,
        });
      }
    });
  });

  const selectedOption = paymentGatewayOptions.find(
    (option) => option.value === selectedGateway,
  );

  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="border-b border-border/60">
        <CardTitle>Payment Gateway</CardTitle>
        <CardDescription>
          Choose which provider new checkout sessions should use.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          {actionState.message ? (
            <Alert variant={actionState.success ? "success" : "destructive"}>
              {actionState.success ? <CircleCheckIcon /> : <OctagonXIcon />}
              <AlertTitle>
                {actionState.success ? "Gateway updated" : "Gateway issue"}
              </AlertTitle>
              <AlertDescription>{actionState.message}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup>
            <Field data-invalid={form.formState.errors.gateway ? true : undefined}>
              <FieldLabel htmlFor="gateway">Active gateway</FieldLabel>
              <FieldContent>
                <Controller
                  control={form.control}
                  name="gateway"
                  render={({ field, fieldState }) => (
                    <>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          id="gateway"
                          className="w-full"
                        >
                          <SelectValue placeholder="Choose gateway" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {paymentGatewayOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        {selectedOption?.description ??
                          "This provider will be used for new checkout sessions."}
                      </FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </>
                  )}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Pending orders keep the gateway they were created with.
            </p>
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save gateway"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
