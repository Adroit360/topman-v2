"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const buildLabel = (range: DateRange | undefined) => {
  if (!range?.from && !range?.to) {
    return "Filter by date range";
  }

  if (range.from && range.to) {
    return `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`;
  }

  if (range.from) {
    return `From ${format(range.from, "MMM d, yyyy")}`;
  }

  return `Until ${format(range.to!, "MMM d, yyyy")}`;
};

export const OrdersDateRangeFilter = ({
  fromDate,
  toDate,
}: {
  fromDate?: Date;
  toDate?: Date;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>({
    from: fromDate,
    to: toDate,
  });
  const appliedRange = {
    from: fromDate,
    to: toDate,
  };

  const displayedRange = open ? range : appliedRange;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setRange(appliedRange);
    }
  };

  const applyRange = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("page");

    if (range?.from) {
      params.set("from", format(range.from, "yyyy-MM-dd"));
    } else {
      params.delete("from");
    }

    if (range?.to) {
      params.set("to", format(range.to, "yyyy-MM-dd"));
    } else {
      params.delete("to");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  };

  const clearRange = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("from");
    params.delete("to");
    params.delete("page");

    setRange(undefined);

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button className="justify-start" size="sm" variant="outline">
          <CalendarIcon data-icon="inline-start" />
          {buildLabel(displayedRange)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <div className="flex flex-col gap-3 p-3">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            numberOfMonths={2}
            onSelect={setRange}
            selected={range}
          />
          <div className="flex items-center justify-between gap-2 border-t border-border px-1 pt-3">
            <Button
              onClick={clearRange}
              size="sm"
              type="button"
              variant="ghost"
            >
              Clear
            </Button>
            <Button onClick={applyRange} size="sm" type="button">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
