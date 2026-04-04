"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { XMarkIcon } from "./Icon";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  scrollable?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  scrollable = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[size];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <dialog
        ref={dialogRef}
        className={`bg-base-100 rounded-lg shadow-xl ${sizeClass} z-50 p-6`}
        style={{
          margin: "auto",
          position: "fixed",
          inset: 0,
          width: "fit-content",
          height: "fit-content",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className={scrollable ? "overflow-y-auto" : ""}>
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{title}</h3>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Close"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          {children}
        </div>
      </dialog>
    </>
  );
}

interface ModalActionsProps {
  children: ReactNode;
  className?: string;
}

export function ModalActions({ children, className = "" }: ModalActionsProps) {
  return <div className={`modal-action ${className}`}>{children}</div>;
}
