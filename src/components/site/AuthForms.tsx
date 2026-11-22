"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/ui/forms/TextField";
import { Checkbox } from "@/components/ui/forms/Checkbox";
import { Select } from "@/components/ui/forms/Select";
import { Button } from "@/components/ui/actions/Button";
import { Alert } from "@/components/ui/feedback/Alert";
import { StatusIcon } from "@/components/ui/icons/icons";
import { routes } from "@/config/site";
import type { ActionState } from "@/lib/action-state";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  PASSWORD_MIN,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type LoginInput,
  type ProfileInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/modules/auth/schemas";
import { changePasswordAction, forgotPasswordAction, loginAction, registerAction, resetPasswordAction, updateProfileAction } from "@/modules/auth/actions";
import { useActionForm } from "./useActionForm";

/* Authentication and account forms, wired to the Server Actions of modules/auth. */

function Feedback({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert>;
}

function FieldMessage({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="ap-field__msg ap-field__msg--error" id={id}>
      <StatusIcon tone="error" />
      <span>{message}</span>
    </p>
  );
}

function Frame({ label, children, ...props }: { label: string; children: ReactNode } & React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form noValidate aria-label={label} className="flex flex-col gap-6" {...props}>
      {children}
    </form>
  );
}

/** `?suivant=` of the current URL (read after hydration), kept when switching login ↔ sign-up. */
function useNextParam(): string {
  return useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("suivant") ?? "",
    () => "",
  );
}
const withNext = (href: string, next: string) => (next ? `${href}?suivant=${encodeURIComponent(next)}` : href);

/** « Déjà client ? » — sign-in. `standalone` adds the link to the sign-up page. */
export function LoginForm({ standalone = true }: { standalone?: boolean }) {
  const next = useNextParam();
  // Return to the protected page that sent the user here (validated again on the server).
  const { form, state, pending, formAction, onSubmit } = useActionForm<LoginInput>(loginAction, zodResolver(loginSchema), { email: "", password: "" }, () => ({
    suivant: new URLSearchParams(window.location.search).get("suivant") ?? "",
  }));
  const e = form.formState.errors;
  return (
    <Frame label="Connexion" action={formAction} onSubmit={onSubmit}>
      <Feedback state={state} />
      <TextField label="Adresse e-mail" type="email" autoComplete="email" required error={e.email?.message} {...form.register("email")} />
      <TextField label="Mot de passe" type="password" autoComplete="current-password" required error={e.password?.message} {...form.register("password")} />
      <a className="self-end font-bold text-primary" href={routes.forgotPassword}>Mot de passe oublié ?</a>
      <div>
        <Button type="submit" loading={pending} loadingLabel="Connexion…">Se connecter</Button>
      </div>
      {standalone ? (
        <p className="m-0 text-text-secondary">
          Pas encore de compte ? <a className="font-bold text-primary underline" href={withNext(routes.register, next)}>Créer un compte</a>
        </p>
      ) : null}
    </Frame>
  );
}

const CIVILITIES = [
  { value: "MME", label: "Mme" },
  { value: "M", label: "M." },
];

/** « Première réservation ? » — account creation (client design « Connexion »). */
export function RegisterForm({ standalone = true }: { standalone?: boolean }) {
  const next = useNextParam();
  const { form, state, pending, formAction, onSubmit } = useActionForm<RegisterInput>(
    registerAction,
    zodResolver(registerSchema),
    {
      civility: undefined as unknown as "MME",
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      emailConfirm: "",
      postalCode: "",
      phone: "",
      password: "",
      passwordConfirm: "",
      acceptTerms: false as unknown as true,
    },
    () => ({ suivant: new URLSearchParams(window.location.search).get("suivant") ?? "" }),
  );
  const e = form.formState.errors;
  return (
    <Frame label="Création de compte" action={formAction} onSubmit={onSubmit}>
      <Feedback state={state} />
      <div className="grid gap-6 md:grid-cols-[minmax(7rem,auto)_1fr_1fr]">
        <Select label="Civilité" required placeholder="Choisir" options={CIVILITIES} error={e.civility?.message} {...form.register("civility")} />
        <TextField label="Prénom" autoComplete="given-name" required error={e.firstName?.message} {...form.register("firstName")} />
        <TextField label="Nom" autoComplete="family-name" required error={e.lastName?.message} {...form.register("lastName")} />
      </div>
      <TextField label="Société" autoComplete="organization" help="Facultatif" error={e.companyName?.message} {...form.register("companyName")} />
      <div className="grid gap-6 md:grid-cols-2">
        <TextField label="Adresse e-mail" type="email" autoComplete="email" required error={e.email?.message} {...form.register("email")} />
        <TextField label="Confirmez l’adresse e-mail" type="email" autoComplete="email" required error={e.emailConfirm?.message} {...form.register("emailConfirm")} />
        <TextField label="Code postal" autoComplete="postal-code" required error={e.postalCode?.message} {...form.register("postalCode")} />
        <TextField label="Téléphone" type="tel" autoComplete="tel" required error={e.phone?.message} {...form.register("phone")} />
        <TextField label="Mot de passe" type="password" autoComplete="new-password" required help={`${PASSWORD_MIN} caractères au minimum.`} error={e.password?.message} {...form.register("password")} />
        <TextField label="Confirmez le mot de passe" type="password" autoComplete="new-password" required error={e.passwordConfirm?.message} {...form.register("passwordConfirm")} />
      </div>
      <div className="flex flex-col gap-2">
        <Checkbox
          label={
            <>
              J’ai compris et j’accepte votre <a className="text-primary underline" href={routes.privacy} target="_blank" rel="noopener">politique de gestion des données</a> et les{" "}
              <a className="text-primary underline" href={routes.terms} target="_blank" rel="noopener">conditions générales de vente</a>
            </>
          }
          invalid={!!e.acceptTerms}
          aria-describedby={e.acceptTerms ? "register-terms-error" : undefined}
          {...form.register("acceptTerms")}
        />
        <FieldMessage id="register-terms-error" message={e.acceptTerms?.message} />
      </div>
      <div>
        <Button type="submit" loading={pending} loadingLabel="Création du compte…">S’inscrire</Button>
      </div>
      {standalone ? (
        <p className="m-0 text-text-secondary">
          Déjà client ? <a className="font-bold text-primary underline" href={withNext(routes.login, next)}>Se connecter</a>
        </p>
      ) : null}
    </Frame>
  );
}

export function ForgotPasswordForm() {
  const { form, state, pending, formAction, onSubmit } = useActionForm<ForgotPasswordInput>(forgotPasswordAction, zodResolver(forgotPasswordSchema), { email: "" });
  return (
    <Frame label="Mot de passe oublié" action={formAction} onSubmit={onSubmit}>
      <p className="m-0 text-text-secondary">Indiquez l’adresse e-mail de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
      <Feedback state={state} />
      <TextField label="Adresse e-mail" type="email" autoComplete="email" required error={form.formState.errors.email?.message} {...form.register("email")} />
      <Button type="submit" fullWidth loading={pending} loadingLabel="Envoi…">Recevoir le lien</Button>
      <a className="text-center text-primary underline" href={routes.login}>Retour à la connexion</a>
    </Frame>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const { form, state, pending, formAction, onSubmit } = useActionForm<ResetPasswordInput>(resetPasswordAction, zodResolver(resetPasswordSchema), { token, password: "", passwordConfirm: "" });
  const e = form.formState.errors;
  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-6">
        <Feedback state={state} />
        <Button href={routes.login} fullWidth>Se connecter</Button>
      </div>
    );
  }
  return (
    <Frame label="Nouveau mot de passe" action={formAction} onSubmit={onSubmit}>
      <input type="hidden" {...form.register("token")} />
      <Feedback state={state} />
      <TextField label="Nouveau mot de passe" type="password" autoComplete="new-password" required help={`${PASSWORD_MIN} caractères au minimum.`} error={e.password?.message} {...form.register("password")} />
      <TextField label="Confirmez le mot de passe" type="password" autoComplete="new-password" required error={e.passwordConfirm?.message} {...form.register("passwordConfirm")} />
      <Button type="submit" fullWidth loading={pending} loadingLabel="Enregistrement…">Enregistrer</Button>
    </Frame>
  );
}

export function ProfileForm({ defaults }: { defaults: ProfileInput }) {
  const { form, state, pending, formAction, onSubmit } = useActionForm<ProfileInput>(updateProfileAction, zodResolver(profileSchema), defaults);
  const e = form.formState.errors;
  return (
    <Frame label="Mes coordonnées" action={formAction} onSubmit={onSubmit}>
      <Feedback state={state} />
      <div className="grid gap-6 md:grid-cols-[minmax(7rem,auto)_1fr_1fr]">
        <Select label="Civilité" placeholder="—" options={CIVILITIES} error={e.civility?.message} {...form.register("civility")} />
        <TextField label="Prénom" autoComplete="given-name" required error={e.firstName?.message} {...form.register("firstName")} />
        <TextField label="Nom" autoComplete="family-name" required error={e.lastName?.message} {...form.register("lastName")} />
      </div>
      <TextField label="Société" autoComplete="organization" help="Facultatif" error={e.companyName?.message} {...form.register("companyName")} />
      <div className="grid gap-6 md:grid-cols-2">
        <TextField label="Code postal" autoComplete="postal-code" error={e.postalCode?.message} {...form.register("postalCode")} />
        <TextField label="Téléphone" type="tel" autoComplete="tel" error={e.phone?.message} {...form.register("phone")} />
      </div>
      <div>
        <Button type="submit" loading={pending} loadingLabel="Enregistrement…">Enregistrer</Button>
      </div>
    </Frame>
  );
}

export function ChangePasswordForm() {
  const { form, state, pending, formAction, onSubmit } = useActionForm<ChangePasswordInput>(changePasswordAction, zodResolver(changePasswordSchema), {
    currentPassword: "",
    password: "",
    passwordConfirm: "",
  });
  const e = form.formState.errors;
  return (
    <Frame label="Changer de mot de passe" action={formAction} onSubmit={onSubmit}>
      <Feedback state={state} />
      <TextField label="Mot de passe actuel" type="password" autoComplete="current-password" required error={e.currentPassword?.message} {...form.register("currentPassword")} />
      <TextField label="Nouveau mot de passe" type="password" autoComplete="new-password" required help={`${PASSWORD_MIN} caractères au minimum. Toutes vos autres sessions seront déconnectées.`} error={e.password?.message} {...form.register("password")} />
      <TextField label="Confirmez le nouveau mot de passe" type="password" autoComplete="new-password" required error={e.passwordConfirm?.message} {...form.register("passwordConfirm")} />
      <div>
        <Button type="submit" loading={pending} loadingLabel="Enregistrement…">Changer de mot de passe</Button>
      </div>
    </Frame>
  );
}
