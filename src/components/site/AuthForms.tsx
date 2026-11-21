"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/ui/forms/TextField";
import { Checkbox } from "@/components/ui/forms/Checkbox";
import { Button } from "@/components/ui/actions/Button";
import { Alert } from "@/components/ui/feedback/Alert";
import { StatusIcon } from "@/components/ui/icons/icons";
import { routes } from "@/config/site";
import {
  forgotPasswordSchema,
  loginSchema,
  PASSWORD_MIN,
  registerSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
} from "@/modules/auth/schemas";

/*
 * Authentication forms (Phase 3: interface and validation). Auth.js, sessions, e-mail verification
 * and reset tokens are wired in Phase 4; until then a valid submission says so explicitly.
 */

function NotYetActive({ what }: { what: string }) {
  return (
    <Alert tone="info" title="Bientôt disponible">
      <p>{`${what} sera activé(e) dans la prochaine étape du projet. Aucune donnée n’a été envoyée.`}</p>
    </Alert>
  );
}

function FormFrame({ children, onSubmit, footer, label }: { children: ReactNode; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; footer?: ReactNode; label: string }) {
  return (
    <form noValidate onSubmit={onSubmit} aria-label={label} className="flex flex-col gap-6">
      {children}
      {footer}
    </form>
  );
}

export function LoginForm() {
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: "onTouched", defaultValues: { email: "", password: "" } });
  const e = formState.errors;
  return (
    <FormFrame label="Connexion" onSubmit={handleSubmit(() => setDone(true))}>
      <TextField label="Adresse e-mail" type="email" autoComplete="email" required error={e.email?.message} {...register("email")} />
      <TextField label="Mot de passe" type="password" autoComplete="current-password" required error={e.password?.message} {...register("password")} />
      <a className="text-primary" href={routes.forgotPassword}>Mot de passe oublié ?</a>
      {done ? <NotYetActive what="La connexion" /> : null}
      <Button type="submit" fullWidth>Se connecter</Button>
      <p className="m-0 text-center text-text-secondary">
        Pas encore de compte ? <a className="font-bold text-primary underline" href={routes.register}>Créer un compte</a>
      </p>
    </FormFrame>
  );
}

export function RegisterForm() {
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", passwordConfirm: "", acceptTerms: false as unknown as true },
  });
  const e = formState.errors;
  return (
    <FormFrame label="Création de compte" onSubmit={handleSubmit(() => setDone(true))}>
      <div className="grid gap-6 md:grid-cols-2">
        <TextField label="Prénom" autoComplete="given-name" required error={e.firstName?.message} {...register("firstName")} />
        <TextField label="Nom" autoComplete="family-name" required error={e.lastName?.message} {...register("lastName")} />
      </div>
      <TextField label="Adresse e-mail" type="email" autoComplete="email" required error={e.email?.message} {...register("email")} />
      <TextField label="Téléphone" type="tel" autoComplete="tel" help="Facultatif, utile le jour de votre départ." error={e.phone?.message} {...register("phone")} />
      <TextField label="Mot de passe" type="password" autoComplete="new-password" required help={`${PASSWORD_MIN} caractères au minimum. Une phrase facile à retenir fonctionne très bien.`} error={e.password?.message} {...register("password")} />
      <TextField label="Confirmez le mot de passe" type="password" autoComplete="new-password" required error={e.passwordConfirm?.message} {...register("passwordConfirm")} />
      <div className="flex flex-col gap-2">
        <Checkbox
          label={
            <>
              J’accepte les <a className="text-primary underline" href={routes.terms} target="_blank" rel="noopener">conditions générales de vente</a> et la{" "}
              <a className="text-primary underline" href={routes.privacy} target="_blank" rel="noopener">politique de confidentialité</a>
            </>
          }
          invalid={!!e.acceptTerms}
          aria-describedby={e.acceptTerms ? "register-terms-error" : undefined}
          {...register("acceptTerms")}
        />
        {e.acceptTerms ? (
          <p className="ap-field__msg ap-field__msg--error" id="register-terms-error">
            <StatusIcon tone="error" />
            <span>{e.acceptTerms.message}</span>
          </p>
        ) : null}
      </div>
      {done ? <NotYetActive what="La création de compte" /> : null}
      <Button type="submit" fullWidth>Créer mon compte</Button>
      <p className="m-0 text-center text-text-secondary">
        Déjà client ? <a className="font-bold text-primary underline" href={routes.login}>Se connecter</a>
      </p>
    </FormFrame>
  );
}

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema), mode: "onTouched", defaultValues: { email: "" } });
  return (
    <FormFrame label="Mot de passe oublié" onSubmit={handleSubmit(() => setDone(true))}>
      <p className="m-0 text-text-secondary">Indiquez l’adresse e-mail de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
      <TextField label="Adresse e-mail" type="email" autoComplete="email" required error={formState.errors.email?.message} {...register("email")} />
      {done ? <NotYetActive what="La réinitialisation du mot de passe" /> : null}
      <Button type="submit" fullWidth>Recevoir le lien</Button>
      <a className="text-center text-primary" href={routes.login}>Retour à la connexion</a>
    </FormFrame>
  );
}
