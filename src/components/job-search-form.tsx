import { EMPLOYMENT_LABELS, EMPLOYMENT_TYPES } from "@/lib/constants";
import type { JobSearchFilters } from "@/lib/validators";

export function JobSearchForm({
  filters,
  locations,
}: {
  filters: JobSearchFilters;
  locations: string[];
}) {
  return (
    <form action="/" method="get" className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <label>
        <span className="label">Keywords</span>
        <input
          className="input"
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Engineer, Northwind"
        />
      </label>
      <label>
        <span className="label">Location</span>
        <input
          className="input"
          name="location"
          defaultValue={filters.location ?? ""}
          placeholder="Berlin"
          list="job-locations"
        />
        <datalist id="job-locations">
          {locations.map((location) => (
            <option key={location} value={location} />
          ))}
        </datalist>
      </label>
      <label>
        <span className="label">Employment type</span>
        <select className="input" name="type" defaultValue={filters.type ?? ""}>
          <option value="">Any type</option>
          {EMPLOYMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {EMPLOYMENT_LABELS[type]}
            </option>
          ))}
        </select>
      </label>
      <button className="btn" type="submit">
        Search
      </button>
    </form>
  );
}
