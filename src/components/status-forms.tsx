"use client";

import { useFormState } from "react-dom";
import { updateApplicationStatus } from "@/actions/applications";
import { updateJobStatus } from "@/actions/jobs";
import { SubmitButton } from "@/components/submit-button";
import {
  APPLICATION_STATUS_LABELS,
  EMPLOYER_APPLICATION_STATUSES,
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  type ApplicationStatus,
  type JobStatus,
} from "@/lib/constants";

export function JobStatusForm({ jobId, status }: { jobId: string; status: JobStatus }) {
  const [state, action] = useFormState(updateJobStatus, {});

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="jobId" value={jobId} />
      <label>
        <span className="label">Job status</span>
        <select className="input" name="status" defaultValue={status}>
          {JOB_STATUSES.map((value) => (
            <option key={value} value={value}>
              {JOB_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton className="btn-secondary" pendingLabel="Updating…">
        Update status
      </SubmitButton>
      {state?.error ? <p className="error">{state.error}</p> : null}
    </form>
  );
}

export function ApplicationStatusForm({
  applicationId,
  candidateName,
  status,
}: {
  applicationId: string;
  candidateName: string;
  status: ApplicationStatus;
}) {
  const [state, action] = useFormState(updateApplicationStatus, {});
  const current = EMPLOYER_APPLICATION_STATUSES.includes(
    status as (typeof EMPLOYER_APPLICATION_STATUSES)[number],
  )
    ? status
    : "SUBMITTED";

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="applicationId" value={applicationId} />
      <select
        className="input w-auto"
        name="status"
        defaultValue={current}
        aria-label={`Status for ${candidateName}`}
      >
        {EMPLOYER_APPLICATION_STATUSES.map((value) => (
          <option key={value} value={value}>
            {APPLICATION_STATUS_LABELS[value]}
          </option>
        ))}
      </select>
      <SubmitButton className="btn-secondary" pendingLabel="Updating…">
        {`Update ${candidateName}`}
      </SubmitButton>
      {state?.error ? <p className="error">{state.error}</p> : null}
    </form>
  );
}
