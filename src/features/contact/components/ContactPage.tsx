import { Clock, Mail, MapPin, Phone } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactForm } from "./ContactForm";
import SectionBread from "@/components/misc/section-breadcrumb";

const contactInfoItems = [
  {
    icon: MapPin,
    label: "Address",
    value: "123 Bookshop Lane, Accra, Ghana",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+233 20 000 0000",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@topmanbooks.com",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Fri, 8 am – 5 pm",
  },
];

export const ContactPage = () => {
  return (
    <div className="pt-10">
      <SectionBread
        title="Contact Us"
        description="Get in touch with us"
        bread={[]}
      />

      <section className="px-4 pb-14 pt-8 sm:px-6 sm:pb-18 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-14">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12 flex flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase shadow-sm">
              <Mail className="size-3" />
              <span>Get in touch</span>
            </div>
            <div className="flex max-w-3xl flex-col gap-3">
              <h1 className="text-balance text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.02]">
                We&apos;d love to hear from you.
              </h1>
              <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Have a question about an order, a book, or want to work with us?
                Drop us a message and we&apos;ll get back to you.
              </p>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
            {/* Contact info */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold tracking-[-0.04em] text-foreground">
                  Contact information
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  Reach us through any of the channels below or use the form.
                </p>
              </div>

              <ul className="flex flex-col gap-5">
                {contactInfoItems.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="flex flex-col gap-0.5 pt-1">
                      <span className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                        {label}
                      </span>
                      <span className="text-sm text-foreground">{value}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <Card className="rounded-[2rem] border border-border bg-background/95 shadow-sm">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  Send a message
                </CardTitle>
                <CardDescription className="text-sm leading-7 text-muted-foreground sm:text-base">
                  Fill in the form below and we&apos;ll respond as soon as
                  possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
