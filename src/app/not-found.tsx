import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl">Page not found</h1>
      <p className="mt-2 text-stone-600">That job or page is not on the board.</p>
      <Link href="/" className="btn mt-6">
        Back to jobs
      </Link>
    </div>
  );
}
