"use client";

import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "../actions/Button";

/*
 * ConfirmDialog — EXTENSION (proposé). The system's Modal with Cancel / Confirm buttons, for
 * actions that need explicit confirmation (cancellation, refund, deletion). No new "danger"
 * button style: the confirm label names the consequence (« Rembourser 45,00 € »).
 */
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  pendingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel = "Annuler", pending, pendingLabel = "En cours…", onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={pending ? undefined : onCancel}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button size="sm" onClick={onConfirm} loading={pending} loadingLabel={pendingLabel}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
