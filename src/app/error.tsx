"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-2 text-stone-600">The page could not be loaded. Try again in a moment.</p>
      <button className="btn mt-6" type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
