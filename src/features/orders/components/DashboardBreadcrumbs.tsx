"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const getLabelForSegment = (
  segment: string,
  index: number,
  segments: string[],
) => {
  if (segment === "dashboard") {
    return "Dashboard";
  }

  if (segment === "orders") {
    return "Orders";
  }

  if (segment === "payments") {
    return "Payments";
  }

  if (segments[index - 1] === "orders") {
    return `Order ${segment.slice(0, 8)}`;
  }

  if (segments[index - 1] === "payments") {
    return `Payment ${segment.slice(0, 8)}`;
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const DashboardBreadcrumbs = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const label = getLabelForSegment(segment, index, segments);
          const isLast = index === segments.length - 1;

          return (
            <Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? (
                <BreadcrumbSeparator className="hidden md:block" />
              ) : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
