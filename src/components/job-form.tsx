"use client";

import { useFormState } from "react-dom";
import { createJob } from "@/actions/jobs";
import { SubmitButton } from "@/components/submit-button";
import { EMPLOYMENT_LABELS, EMPLOYMENT_TYPES } from "@/lib/constants";

export function JobForm() {
  const [state, action] = useFormState(createJob, {});

  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.error ? <p className="error">{state.error}</p> : null}
      <label className="block">
        <span className="label">Title</span>
        <input className="input" name="title" />
        {state.fieldErrors?.title?.[0] ? (
          <span className="error mt-1 block">{state.fieldErrors.title[0]}</span>
        ) : null}
      </label>
      <label className="block">
        <span className="label">Description</span>
        <textarea className="input min-h-36" name="description" />
        {state.fieldErrors?.description?.[0] ? (
          <span className="error mt-1 block">{state.fieldErrors.description[0]}</span>
        ) : null}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Location</span>
          <input className="input" name="location" placeholder="Berlin" />
          {state.fieldErrors?.location?.[0] ? (
            <span className="error mt-1 block">{state.fieldErrors.location[0]}</span>
          ) : null}
        </label>
        <label className="block">
          <span className="label">Employment type</span>
          <select className="input" name="employmentType" defaultValue="FULL_TIME">
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EMPLOYMENT_LABELS[type]}
              </option>
            ))}
          </select>
          {state.fieldErrors?.employmentType?.[0] ? (
            <span className="error mt-1 block">{state.fieldErrors.employmentType[0]}</span>
          ) : null}
        </label>
        <label className="block">
          <span className="label">Minimum salary</span>
          <input className="input" name="salaryMin" inputMode="numeric" />
          {state.fieldErrors?.salaryMin?.[0] ? (
            <span className="error mt-1 block">{state.fieldErrors.salaryMin[0]}</span>
          ) : null}
        </label>
        <label className="block">
          <span className="label">Maximum salary</span>
          <input className="input" name="salaryMax" inputMode="numeric" />
          {state.fieldErrors?.salaryMax?.[0] ? (
            <span className="error mt-1 block">{state.fieldErrors.salaryMax[0]}</span>
          ) : null}
        </label>
      </div>
      <label className="block">
        <span className="label">Visibility</span>
        <select className="input" name="status" defaultValue="OPEN">
          <option value="OPEN">Open — list it on the board</option>
          <option value="DRAFT">Draft — keep it off the board</option>
        </select>
      </label>
      <SubmitButton pendingLabel="Saving…">Save job</SubmitButton>
    </form>
  );
}
