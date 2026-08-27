import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center text-foreground">
      <div className="text-6xl font-semibold">404</div>
      <p className="mt-3 text-muted-foreground">This page does not exist.</p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}