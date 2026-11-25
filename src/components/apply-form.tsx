"use client";

import { useFormState } from "react-dom";
import { applyToJob } from "@/actions/applications";
import { SubmitButton } from "@/components/submit-button";

export function ApplyForm({ jobId }: { jobId: string }) {
  const [state, action] = useFormState(applyToJob.bind(null, jobId), {});

  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.error ? <p className="error">{state.error}</p> : null}
      <label className="block">
        <span className="label">Cover letter</span>
        <textarea className="input min-h-32" name="coverLetter" />
        {state.fieldErrors?.coverLetter?.[0] ? (
          <span className="error mt-1 block">{state.fieldErrors.coverLetter[0]}</span>
        ) : null}
      </label>
      <label className="block">
        <span className="label">Resume</span>
        <input
          className="input file:mr-3 file:rounded file:border-0 file:bg-sand file:px-2 file:py-1"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <span className="mt-1 block text-xs text-stone-500">PDF or Word, up to 5 MB.</span>
      </label>
      <SubmitButton pendingLabel="Sending…">Submit application</SubmitButton>
    </form>
  );
}
