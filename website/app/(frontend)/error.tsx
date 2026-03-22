"use client";

import React from "react";

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="material-symbols-outlined text-primary text-6xl mb-6">
        error_outline
      </span>
      <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-white mb-4">
        Something Went Wrong
      </h1>
      <p className="text-slate-400 text-lg max-w-md mb-8">
        We encountered an unexpected error loading this page. This is usually
        temporary -- please try again.
      </p>
      <button
        onClick={reset}
        className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
