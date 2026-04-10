"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

type FormField = {
  name: string;
  label?: string;
  blockType: string;
  required?: boolean;
  width?: number;
  defaultValue?: string;
  options?: { label: string; value: string }[];
  message?: unknown;
};

type FormData = {
  id: string;
  title: string;
  fields: FormField[];
  confirmationType?: string;
  confirmationMessage?: unknown;
  redirect?: { url?: string };
};

export function DynamicForm({
  form,
  onClose,
}: {
  form: FormData;
  onClose?: () => void;
}) {
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSubmitted && form?.confirmationType === 'redirect' && form?.redirect?.url) {
      if (typeof window !== 'undefined') {
        window.location.href = form.redirect.url;
      }
    }
  }, [isSubmitted, form?.confirmationType, form?.redirect?.url]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const initialValues: Record<string, string> = {};
      form.fields.forEach(field => {
        if (field.blockType === "checkbox" && field.defaultValue === 'true') {
          initialValues[field.name] = "true";
        } else if (field.defaultValue) {
          initialValues[field.name] = field.defaultValue;
        }
      });
      const finalValues = { ...initialValues, ...formState };

      const submissionData = Object.entries(finalValues).map(
        ([field, value]) => ({
          field,
          value,
        })
      );

      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: form.id,
          submissionData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit form");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    // Honor CMS-controlled confirmation behavior
    if (form?.confirmationType === 'redirect' && form?.redirect?.url) {
      return null;
    }

    const confirmationText = (form?.confirmationType === 'message' && form?.confirmationMessage)
      ? (typeof form.confirmationMessage === 'string'
          ? form.confirmationMessage
          : 'Thank you for your interest in Gaines Boxing Club!')
      : 'Thank you for your interest in Gaines Boxing Club!';

    return (
      <div className="text-center py-8">
        <Icon icon="material-symbols:check-circle" className="text-primary text-5xl mb-4 block" />
        <p className="text-lg font-semibold text-white mb-2">
          {confirmationText}
        </p>
        <p className="text-slate-400 text-sm">
          We will be in touch shortly.
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-all cursor-pointer"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {form.fields.map((field) => {
          // Skip message-type fields (display only)
          if (field.blockType === "message") return null;

          const isFullWidth = (field.width ?? 100) > 50;
          const wrapperClass = isFullWidth ? "sm:col-span-2" : "";

          const inputBaseClass =
            "w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-slate-500";

          return (
            <div key={field.name} className={wrapperClass}>
              {field.label && (
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold text-slate-300 mb-1.5"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-primary ml-1">*</span>
                  )}
                </label>
              )}

              {field.blockType === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  rows={4}
                  value={formState[field.name] ?? field.defaultValue ?? ""}
                  onChange={handleChange}
                  className={inputBaseClass}
                  placeholder={field.label ?? ""}
                />
              ) : field.blockType === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={formState[field.name] ?? field.defaultValue ?? ""}
                  onChange={handleChange}
                  className={inputBaseClass}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.blockType === "checkbox" ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    defaultChecked={field.defaultValue === 'true'}
                    aria-required={field.required || undefined}
                    className="accent-primary w-4 h-4"
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.checked ? "true" : "false",
                      }))
                    }
                  />
                  <span className="text-slate-300 text-sm">{field.label}</span>
                </label>
              ) : (
                <input
                  type={field.blockType === "email" ? "email" : field.blockType === "number" ? "number" : "text"}
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={formState[field.name] ?? field.defaultValue ?? ""}
                  onChange={handleChange}
                  className={inputBaseClass}
                  placeholder={field.label ?? ""}
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-black text-sm uppercase tracking-widest transition-all cursor-pointer"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
