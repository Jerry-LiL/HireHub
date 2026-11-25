"use client";

import { useFormState } from "react-dom";
import { loginAction } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm() {
  const [state, action] = useFormState(loginAction, {});

  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.error ? <p className="error">{state.error}</p> : null}
      <label className="block">
        <span className="label">Email</span>
        <input className="input" name="email" type="email" autoComplete="email" />
        {state.fieldErrors?.email?.[0] ? (
          <span className="error mt-1 block">{state.fieldErrors.email[0]}</span>
        ) : null}
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input className="input" name="password" type="password" autoComplete="current-password" />
        {state.fieldErrors?.password?.[0] ? (
          <span className="error mt-1 block">{state.fieldErrors.password[0]}</span>
        ) : null}
      </label>
      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
