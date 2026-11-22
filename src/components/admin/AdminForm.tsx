"use client";

import { createContext, startTransition, useActionState, useContext, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/actions/Button";
import { Alert } from "@/components/ui/feedback/Alert";
import { ConfirmDialog } from "@/components/ui/feedback/ConfirmDialog";
import { TextField, type TextFieldProps } from "@/components/ui/forms/TextField";
import { Select, type SelectProps } from "@/components/ui/forms/Select";
import { Checkbox } from "@/components/ui/forms/Checkbox";
import { IDLE, type ActionState } from "@/lib/action-state";
import { cx } from "@/components/ui/lib/cx";
import { useOptionalToast } from "@/components/ui/feedback/Toast";

/*
 * Back-office form bound to a Server Action (useActionState). Fields are design-system components
 * that read their error from the action result by name, so pages stay Server Components and only
 * pass fields as children. Destructive actions pass `confirm`: the dialog names the consequence.
 */

const StateCtx = createContext<ActionState>(IDLE);

export interface AdminFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children?: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  hidden?: Record<string, string>;
  confirm?: { title: string; body: ReactNode; confirmLabel: string };
  variant?: "primary" | "secondary";
  /** Inline: fields and button on one row (filters, small actions). */
  inline?: boolean;
  label?: string;
  className?: string;
}

export function AdminForm({ action, children, submitLabel, pendingLabel = "Enregistrement…", hidden, confirm, variant = "primary", inline, label, className }: AdminFormProps) {
  const toast = useOptionalToast();
  // The success message is also toasted from here, before React commits the refreshed page: the
  // form itself often disappears with the change it made (« Véhicule déposé » once checked in).
  const [state, formAction, pending] = useActionState(async (prev: ActionState, fd: FormData) => {
    const next = await action(prev, fd);
    if (next.status === "success" && next.message) toast({ tone: "success", message: next.message });
    return next;
  }, IDLE);
  const [asking, setAsking] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const send = () => {
    const fd = new FormData(formRef.current!);
    startTransition(() => formAction(fd));
  };

  return (
    <StateCtx.Provider value={state}>
      <form
        ref={formRef}
        // Named forms are landmarks: only full forms get a name; inline row actions (a button in a
        // table cell) stay unnamed, their button label says what they do.
        aria-label={inline ? undefined : (label ?? submitLabel)}
        noValidate
        className={cx(inline ? "flex flex-wrap items-end gap-4" : "flex flex-col gap-6", className)}
        onSubmit={(e) => {
          e.preventDefault();
          if (confirm) setAsking(true);
          else send();
        }}
      >
        {state.message && !inline ? <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert> : null}
        {hidden ? Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />) : null}
        {children}
        <div>
          <Button type="submit" size="sm" variant={variant} loading={pending} loadingLabel={pendingLabel}>
            {submitLabel}
          </Button>
        </div>
        {state.message && inline ? (
          <p role="status" className={cx("m-0 basis-full", state.status === "success" ? "text-success" : "text-error")}>{state.message}</p>
        ) : null}
      </form>
      {confirm ? (
        <ConfirmDialog
          open={asking}
          title={confirm.title}
          confirmLabel={confirm.confirmLabel}
          cancelLabel="Retour"
          pending={pending}
          onCancel={() => setAsking(false)}
          onConfirm={() => {
            setAsking(false);
            send();
          }}
        >
          {confirm.body}
        </ConfirmDialog>
      ) : null}
    </StateCtx.Provider>
  );
}

function useFieldError(name: string | undefined): string | undefined {
  const state = useContext(StateCtx);
  return name ? state.fieldErrors?.[name] : undefined;
}

export function FormText(props: TextFieldProps & { name: string }) {
  const error = useFieldError(props.name);
  return <TextField {...(props as TextFieldProps)} error={props.error ?? error} />;
}

export function FormSelect(props: SelectProps & { name: string }) {
  const error = useFieldError(props.name);
  return <Select {...props} error={props.error ?? error} />;
}

export function FormCheckbox({ name, label, defaultChecked, value = "on", disabled }: { name: string; label: ReactNode; defaultChecked?: boolean; value?: string; disabled?: boolean }) {
  return <Checkbox name={name} label={label} defaultChecked={defaultChecked} value={value} disabled={disabled} />;
}
