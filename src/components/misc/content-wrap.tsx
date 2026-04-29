import { ReactNode } from "react";

export default function ContentWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-4 pb-14 sm:px-6 sm:pb-18 lg:px-8 lg:pb-24 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
