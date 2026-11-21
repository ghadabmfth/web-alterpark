"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useForm, type DefaultValues, type FieldValues, type Path, type Resolver } from "react-hook-form";
import { IDLE, type ActionState } from "@/lib/action-state";

/*
 * React Hook Form + Server Action. The client validates first (instant feedback); a valid form is
 * posted to the action, which validates again and may return field errors, shown on the fields.
 * The <form action> attribute keeps the form working without JavaScript.
 */
export function useActionForm<T extends FieldValues>(
  action: (prev: ActionState, data: FormData) => Promise<ActionState>,
  resolver: Resolver<T>,
  defaultValues: DefaultValues<T>,
  /** Extra fields computed at submit time (e.g. the return path read from the URL). */
  extra?: () => Record<string, string>,
) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  const form = useForm<T>({ resolver, mode: "onTouched", defaultValues });

  useEffect(() => {
    for (const [name, message] of Object.entries(state.fieldErrors ?? {})) {
      form.setError(name as Path<T>, { type: "server", message }, { shouldFocus: true });
    }
  }, [state, form]);

  const onSubmit = form.handleSubmit((_values, event) => {
    const el = event?.target;
    if (!(el instanceof HTMLFormElement)) return;
    const data = new FormData(el);
    for (const [k, v] of Object.entries(extra?.() ?? {})) data.set(k, v);
    startTransition(() => formAction(data));
  });

  return { form, state, pending, formAction, onSubmit };
}
