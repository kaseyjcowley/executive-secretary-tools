"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  className = "",
  children,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
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

  const modalContent = (
    <dialog className={`modal modal-open ${className}`} open={isOpen}>
      <div className="modal-box">
        {title && <h3 className="font-bold text-lg mb-4">{title}</h3>}
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );

  if (typeof window === "undefined") return null;

  return createPortal(modalContent, document.body);
}

export function ModalActions({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`modal-action ${className}`}>{children}</div>;
}

Modal.Actions = ModalActions;
