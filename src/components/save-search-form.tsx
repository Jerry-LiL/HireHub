"use client";

import { useFormState } from "react-dom";
import { saveSearch } from "@/actions/saved-searches";
import { SubmitButton } from "@/components/submit-button";
import type { JobSearchFilters } from "@/lib/validators";

export function SaveSearchForm({ filters }: { filters: JobSearchFilters }) {
  const [state, action] = useFormState(saveSearch, {});

  return (
    <form action={action} className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-end">
      <input type="hidden" name="query" value={filters.q ?? ""} />
      <input type="hidden" name="location" value={filters.location ?? ""} />
      <input type="hidden" name="employmentType" value={filters.type ?? ""} />
      <label className="block flex-1">
        <span className="label">Search name</span>
        <input className="input" name="name" placeholder="Berlin roles" />
        {state.fieldErrors?.name?.[0] ? (
          <span className="error mt-1 block">{state.fieldErrors.name[0]}</span>
        ) : null}
      </label>
      <SubmitButton className="btn-secondary" pendingLabel="Saving…">
        Save search
      </SubmitButton>
      {state?.error ? <p className="error sm:self-center">{state.error}</p> : null}
    </form>
  );
}
