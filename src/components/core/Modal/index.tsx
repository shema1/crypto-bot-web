import type { FC, ReactNode } from "react";
import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

export interface ModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Called when the modal should close (e.g. overlay click, close button, Escape) */
  onClose: () => void;
  /** Modal content */
  children: ReactNode;
  /** Optional title shown in the header */
  title?: ReactNode;
  /** Optional footer content (e.g. action buttons) */
  footer?: ReactNode;
  /** If true, clicking the overlay does not close the modal */
  closeOnOverlayClick?: boolean;
  /** If true, pressing Escape does not close the modal */
  closeOnEscape?: boolean;
}

const Modal: FC<ModalProps> = ({
  open,
  onClose,
  children,
  title,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    },
    [onClose, closeOnOverlayClick]
  );

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, closeOnEscape]);

  if (!open) return null;

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <div className="modal-header">
          {title !== undefined && (
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
          )}
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer !== undefined && (
          <div className="modal-footer">{footer}</div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
