"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { registerAction } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";

export function RegisterForm() {
  const [state, action] = useFormState(registerAction, {});
  const [role, setRole] = useState<"CANDIDATE" | "EMPLOYER">("CANDIDATE");

  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.error ? <p className="error">{state.error}</p> : null}
      <label className="block">
        <span className="label">Name</span>
        <input className="input" name="name" autoComplete="name" />
        {state.fieldErrors?.name?.[0] ? (
          <span className="error mt-1 block">{state.fieldErrors.name[0]}</span>
        ) : null}
      </label>
      <label className="block">
        <span className="label">Email</span>
        <input className="input" name="email" type="email" autoComplete="email" />
        {state.fieldErrors?.email?.[0] ? (
          <span className="error mt-1 block">{state.fieldErrors.email[0]}</span>
        ) : null}
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input className="input" name="password" type="password" autoComplete="new-password" />
        {state.fieldErrors?.password?.[0] ? (
          <span className="error mt-1 block">{state.fieldErrors.password[0]}</span>
        ) : null}
      </label>
      <label className="block">
        <span className="label">Account type</span>
        <select
          className="input"
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value as "CANDIDATE" | "EMPLOYER")}
        >
          <option value="CANDIDATE">Candidate</option>
          <option value="EMPLOYER">Employer</option>
        </select>
      </label>
      {role === "EMPLOYER" ? (
        <div className="space-y-4">
          <label className="block">
            <span className="label">Company name</span>
            <input className="input" name="companyName" autoComplete="organization" />
            {state.fieldErrors?.companyName?.[0] ? (
              <span className="error mt-1 block">{state.fieldErrors.companyName[0]}</span>
            ) : null}
          </label>
          <label className="block">
            <span className="label">Company location</span>
            <input className="input" name="companyLocation" placeholder="Berlin" />
          </label>
        </div>
      ) : null}
      <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
    </form>
  );
}
