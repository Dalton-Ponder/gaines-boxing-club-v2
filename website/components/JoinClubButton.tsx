"use client";

import { useModal } from "@/components/ModalProvider";
import { DynamicForm } from "@/components/DynamicForm";
import React from "react";

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

export function JoinClubButton({
  className,
  children = "Join the Club",
  formData,
}: {
  className?: string;
  children?: React.ReactNode;
  formData?: FormDataProp;
}) {
  const { open, close } = useModal();

  const openJoinModal = () => {
    open({
      subtitle: "Become a Member",
      title: <>Join the <span style={{ color: '#c14e01' }}>Club</span></>,
      body: formData && formData.id && formData.fields ? (
        <DynamicForm form={formData as PayloadForm} onClose={close} />
      ) : (
        <p className="text-slate-400">Form is currently unavailable. Please try again later.</p>
      ),
    });
  };

  return (
    <button
      onClick={openJoinModal}
      className={className || "w-full sm:w-auto min-w-[200px] h-14 rounded-lg bg-primary px-8 font-display text-sm font-black uppercase tracking-widest text-white hover:scale-105 transition-transform glow-accent cursor-pointer"}
    >
      {children}
    </button>
  );
}
