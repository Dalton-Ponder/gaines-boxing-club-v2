"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ModalOptions {
  title?: string;
  subtitle?: string;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "lg" | "";
}

interface ModalContextType {
  open: (options: ModalOptions) => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextType>({
  open: () => {},
  close: () => {},
});

export function useModal() {
  return useContext(ModalContext);
}

export default function ModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions>({});

  const open = useCallback((opts: ModalOptions) => {
    setOptions(opts);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {/* Modal DOM */}
      <div
        className={`gbc-modal-overlay ${isOpen ? "active" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
      >
        <div
          className={`gbc-modal ${options.size === "sm" ? "modal-sm" : ""} ${options.size === "lg" ? "modal-lg" : ""}`}
        >
          <button
            className="gbc-modal-close"
            aria-label="Close modal"
            onClick={close}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "20px" }}
            >
              close
            </span>
          </button>
          {(options.subtitle || options.title) && (
            <div className="gbc-modal-header">
              {options.subtitle && (
                <span className="modal-subtitle">{options.subtitle}</span>
              )}
              {options.title && (
                <h2 dangerouslySetInnerHTML={{ __html: options.title }} />
              )}
            </div>
          )}
          <div className="gbc-modal-body">{options.body}</div>
          {options.footer && (
            <div className="gbc-modal-footer">{options.footer}</div>
          )}
        </div>
      </div>
    </ModalContext.Provider>
  );
}
