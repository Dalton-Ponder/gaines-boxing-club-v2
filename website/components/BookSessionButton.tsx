"use client";

import { useModal } from "@/components/ModalProvider";
import { DynamicForm } from "@/components/DynamicForm";
import React from "react";
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

type PayloadForm = {
  id: string;
  title: string;
  fields: FormField[];
  confirmationType?: string;
  confirmationMessage?: unknown;
  redirect?: { url?: string };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormDataProp = PayloadForm | Record<string, any> | null;

export function BookSessionButton({
  className,
  children = "Book a Session",
  formData,
}: {
  className?: string;
  children?: React.ReactNode;
  formData?: FormDataProp;
}) {
  const { open, close } = useModal();

  const openBookModal = () => {
    open({
      subtitle: "Reserve Your Spot",
      title: <>Book a <span style={{ color: "#c14e01" }}>Session</span></>,
      body:
        formData && formData.id && formData.fields ? (
          <DynamicForm form={formData as PayloadForm} onClose={close} />
        ) : (
          <p className="text-slate-400">
            The booking form is not available right now. Give us a call to reserve your spot.
          </p>
        ),
    });
  };

  return (
    <button
      type="button"
      onClick={openBookModal}
      className={
        className ||
        "w-full sm:w-auto min-w-[200px] h-14 rounded-lg bg-primary px-8 font-display text-sm font-black uppercase tracking-widest text-white hover:scale-105 transition-transform glow-accent cursor-pointer flex items-center justify-center gap-3"
      }
    >
      {children}
      <Icon icon="material-symbols:trending-flat" />
    </button>
  );
}
