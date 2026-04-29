"use server";

import { db } from "@/db";
import { contactSubmission } from "@/db/schema/contact";
import { mailer } from "@/lib/mailer";
import { contactSchema } from "../schema/contact-schema";
import {
  contactFieldNames,
  type ContactFieldName,
  type ContactResult,
} from "../types";
import { env } from "../../../../data/env";

const toFieldErrors = (error: unknown): ContactResult["fieldErrors"] => {
  const fieldErrors: Partial<Record<ContactFieldName, string>> = {};

  if (!(error instanceof Error) || !("issues" in error)) {
    return fieldErrors;
  }

  const issues = (
    error as { issues?: Array<{ path?: string[]; message: string }> }
  ).issues;

  if (!issues) {
    return fieldErrors;
  }

  for (const issue of issues) {
    const fieldName = issue.path?.[0] as ContactFieldName | undefined;

    if (fieldName && contactFieldNames.includes(fieldName)) {
      fieldErrors[fieldName] = issue.message;
    }
  }

  return fieldErrors;
};

export const submitContact = async (
  formData: FormData,
): Promise<ContactResult> => {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { name, email, phone, subject, message } = parsed.data;

  try {
    await db.insert(contactSubmission).values({
      id: crypto.randomUUID(),
      name,
      email,
      phone: phone ?? null,
      subject,
      message,
      status: "new",
    });

    await mailer.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: env.CONTACT_TO_EMAIL,
      subject: `New contact: ${subject}`,
      html: `
        <h2>New Contact Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    await mailer.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: `We received your message — ${subject}`,
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for reaching out. We've received your message and will get back to you shortly.</p>
        <p><strong>Your message:</strong></p>
        <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
        <p>— Topman Bookshop</p>
      `,
    });

    return {
      success: true,
      message: "Your message has been sent. We'll be in touch soon.",
    };
  } catch (error) {
    console.error("[submitContact]", error);

    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
};
